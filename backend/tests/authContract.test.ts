// WAJIB import pertama: menyiapkan env test sebelum modul aplikasi diimpor.
import "./helpers/testEnv";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { startTestServer, type TestServer } from "./helpers/server";
import { callApi, jsonInit } from "./helpers/http";
import { signToken, authHeader } from "./helpers/token";
import { authorize } from "../middleware/authorizeMiddleware";
import {
  buildRecruiterDashboard,
  RECENT_APPLICATION_DAYS,
  RECENT_APPLICATION_WINDOW_SQL,
  RECRUITER_TOTALS_QUERY,
  type RecruiterDashboardJobRow,
} from "../controllers/recruiterDashboardController";
import type { NextFunction, Request, Response } from "express";

type BaselineRoute = {
  order: number;
  method: string;
  path: string;
  handlers: Array<{ name: string; arity: number }>;
};
type Baseline = {
  mountPrefix: string;
  routes: BaselineRoute[];
};

const baseline: Baseline = JSON.parse(
  fs.readFileSync(path.join(__dirname, "baseline", "routes.json"), "utf8")
);

const PROTECTED = baseline.routes.filter(
  (r) => r.handlers[0]?.name === "verifyToken"
);
const PUBLIC = baseline.routes.filter(
  (r) => r.handlers[0]?.name !== "verifyToken"
);

/**
 * Route yang memakai authorize(role). Diturunkan dari source
 * backend/routes.ts; ke-10 route ini harus cocok dengan route berantai
 * [verifyToken, <anonymous> arity 3, handler] pada baseline.
 */
const ROLE_RULES: Record<string, "jobseeker" | "recruiter"> = {
  "POST /jobs": "recruiter",
  "GET /recruiter/jobs": "recruiter",
  "GET /recruiter/dashboard": "recruiter",
  "GET /insights": "jobseeker",
  "PUT /jobs/:id": "recruiter",
  "DELETE /jobs/:id": "recruiter",
  "POST /jobs/:id/apply": "jobseeker",
  "GET /jobs/:id/applications": "recruiter",
  "GET /applications/me": "jobseeker",
  "PATCH /applications/:id": "recruiter",
  "GET /applications/:id/cv": "recruiter",
};

const NO_TOKEN = { success: false, message: "Token tidak ditemukan" };
const BAD_TOKEN = { success: false, message: "Token tidak valid atau sudah expired" };
const FORBIDDEN = { success: false, message: "Akses ditolak" };

/** Path konkret untuk request (placeholder :id diisi). */
function concrete(routePath: string): string {
  return routePath.replace(":id", "1");
}

let server: TestServer;

before(async () => {
  server = await startTestServer();
});

after(async () => {
  await server.close();
});

describe("L1 - autentikasi dan otorisasi", () => {
  it("baseline memisahkan 20 route terlindungi dan 4 route publik", () => {
    assert.equal(PROTECTED.length, 20);
    assert.equal(PUBLIC.length, 4);
    assert.deepEqual(
      PUBLIC.map((r) => `${r.method} ${r.path}`).sort(),
      [
        "POST /auth/forgot-password",
        "POST /auth/reset-password",
        "POST /login",
        "POST /register",
      ]
    );
  });

  it("semua route terlindungi menolak tanpa token dengan 401 + pesan kontrak", async () => {
    for (const route of PROTECTED) {
      const url = `${server.baseUrl}${baseline.mountPrefix}${concrete(route.path)}`;
      const res = await callApi(url, { method: route.method });
      assert.equal(
        res.status,
        401,
        `${route.method} ${route.path} tanpa token harus 401, dapat ${res.status} ${res.text}`
      );
      assert.deepEqual(
        res.json,
        NO_TOKEN,
        `${route.method} ${route.path} - bentuk body 401 berubah`
      );
    }
  });

  it("token tidak valid ditolak dengan 401 + pesan kontrak", async () => {
    for (const route of PROTECTED) {
      const url = `${server.baseUrl}${baseline.mountPrefix}${concrete(route.path)}`;
      const res = await callApi(url, {
        method: route.method,
        headers: { Authorization: "Bearer token-tidak-valid-123456" },
      });
      assert.equal(res.status, 401, `${route.method} ${route.path} harus 401`);
      assert.deepEqual(res.json, BAD_TOKEN, `${route.method} ${route.path}`);
    }
  });

  it("role yang salah ditolak dengan 403 + pesan kontrak", async () => {
    for (const route of PROTECTED) {
      const key = `${route.method} ${route.path}`;
      const required = ROLE_RULES[key];
      if (!required) continue;
      const wrongRole = required === "recruiter" ? "jobseeker" : "recruiter";
      const url = `${server.baseUrl}${baseline.mountPrefix}${concrete(route.path)}`;
      const res = await callApi(url, {
        method: route.method,
        headers: authHeader(signToken(wrongRole)),
      });
      assert.equal(
        res.status,
        403,
        `${key} dengan role ${wrongRole} harus 403, dapat ${res.status} ${res.text}`
      );
      assert.deepEqual(res.json, FORBIDDEN, key);
    }
  });

  it("daftar ROLE_RULES menutup seluruh route yang memakai authorize()", () => {
    const roleGated = PROTECTED.filter(
      (r) =>
        r.handlers[1]?.name === "<anonymous>" && r.handlers[1]?.arity === 3
    ).map((r) => `${r.method} ${r.path}`);
    assert.deepEqual(roleGated.sort(), Object.keys(ROLE_RULES).sort());
  });

  it("GET /api/jobs tanpa token tetap 401 (perilaku wajib dipertahankan)", async () => {
    const res = await callApi(`${server.baseUrl}/api/jobs`);
    assert.equal(res.status, 401);
    assert.deepEqual(res.json, NO_TOKEN);
  });

  it("route publik tetap publik: menolak dengan 400 validasi, bukan 401", async () => {
    for (const route of PUBLIC) {
      const url = `${server.baseUrl}${baseline.mountPrefix}${route.path}`;
      const res = await callApi(url, jsonInit(route.method, {}));
      assert.notEqual(res.status, 401, `${route.method} ${route.path} tidak boleh 401`);
      assert.equal(
        res.status,
        400,
        `${route.method} ${route.path} harus 400 (validasi), dapat ${res.status} ${res.text}`
      );
    }
  });

  it("route tidak dikenal menghasilkan 404 + pesan kontrak", async () => {
    const res = await callApi(`${server.baseUrl}/api/tidak-ada-xyz-123`);
    assert.equal(res.status, 404);
    assert.deepEqual(res.json, {
      success: false,
      message: "Endpoint tidak ditemukan",
    });
  });

  it("health check GET / menghasilkan 200 + body kontrak", async () => {
    const res = await callApi(`${server.baseUrl}/`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.json, {
      success: true,
      message: "Backend Express + MySQL berjalan!",
    });
  });
});

/**
 * Unit test middleware `authorize()`.
 *
 * CATATAN PENTING - jalur "req.user tidak tersedia" TIDAK bisa dicapai
 * melalui HTTP pada konfigurasi saat ini: setiap route yang memakai
 * `authorize()` selalu menjalankan `verifyToken` lebih dulu, dan
 * `verifyToken` selalu mengisi `req.user` atau lebih dulu mengembalikan 401
 * ("Token tidak ditemukan"). Cabang 401 "Belum terautentikasi" karena itu
 * hanya bisa dipicu dengan memanggil middleware-nya secara langsung.
 *
 * Test ini tetap bernilai karena "Belum terautentikasi" dipakai dua file
 * frontend (app/home/page.tsx dan app/insight-karier/page.tsx) untuk
 * mengenali kegagalan autentikasi. Kalau pesannya diubah, test ini gagal.
 *
 * Dua kasus lain disertakan agar cabang 401 "tidak ada user" tidak bisa
 * tertukar dengan cabang 403 "role salah" atau dengan "lolos".
 */
describe("unit test middleware authorize()", () => {
  type Captured = { status?: number; body?: unknown };

  function createResponse() {
    const captured: Captured = {};
    const res = {
      status(code: number) {
        captured.status = code;
        return res;
      },
      json(body: unknown) {
        captured.body = body;
        return res;
      },
    };
    return { res: res as unknown as Response, captured };
  }

  function createNext() {
    const state = { called: false };
    const next = (() => {
      state.called = true;
    }) as unknown as NextFunction;
    return { next, state };
  }

  it("req.user tidak tersedia -> 401 'Belum terautentikasi' dan next() tidak dipanggil", () => {
    const { res, captured } = createResponse();
    const { next, state } = createNext();

    authorize("recruiter")({} as unknown as Request, res, next);

    assert.equal(captured.status, 401);
    assert.deepEqual(captured.body, {
      success: false,
      message: "Belum terautentikasi",
    });
    assert.equal(state.called, false, "next() tidak boleh dipanggil");
  });

  it("req.user dengan role yang salah -> 403 'Akses ditolak' dan next() tidak dipanggil", () => {
    const { res, captured } = createResponse();
    const { next, state } = createNext();

    authorize("recruiter")(
      { user: { id: 1, email: "a@b.local", role: "jobseeker" } } as unknown as Request,
      res,
      next
    );

    assert.equal(captured.status, 403);
    assert.deepEqual(captured.body, {
      success: false,
      message: "Akses ditolak",
    });
    assert.equal(state.called, false, "next() tidak boleh dipanggil");
  });

  it("req.user dengan role yang benar -> next() dipanggil tanpa respons", () => {
    const { res, captured } = createResponse();
    const { next, state } = createNext();

    authorize("recruiter")(
      { user: { id: 1, email: "a@b.local", role: "recruiter" } } as unknown as Request,
      res,
      next
    );

    assert.equal(state.called, true, "next() harus dipanggil");
    assert.equal(captured.status, undefined, "tidak boleh ada status respons");
    assert.equal(captured.body, undefined, "tidak boleh ada body respons");
  });
});

/**
 * Kontrak endpoint dashboard recruiter (GET /api/recruiter/dashboard).
 *
 * Letak test: `backend/package.json` menjalankan suite dengan daftar file
 * eksplisit, dan package manifest tidak boleh diubah pada tahap ini -
 * karena itu test ini digabung ke file test yang sudah ada.
 *
 * CATATAN 401/403: kedua kontrak itu SUDAH tercakup otomatis oleh loop di
 * atas ("semua route terlindungi menolak tanpa token" dan "role yang salah
 * ditolak") karena route baru memakai rantai [verifyToken, authorize] yang
 * sama dan sudah tercatat di baseline kontrak.
 *
 * BATAS TESTABILITY (penting): endpoint ini querying database sungguhan,
 * jadi jalur sukses 200 BELUM dapat dibuktikan di sini - itu membutuhkan
 * database uji. Yang dibuktikan di sini:
 *   (a) endpoint benar-benar menyentuh database, bukan mengembalikan
 *       dashboard rekaan saat database tidak terjangkau;
 *   (b) bentuk respons dan aritmetika agregasinya, lewat unit test fungsi
 *       pemetaan murni dengan baris fixture.
 * (b) BUKAN bukti integrasi database - ia hanya membuktikan bentuk data
 * dan perhitungan jumlah.
 */
describe("kontrak endpoint dashboard recruiter", () => {
  it("jendela 7 hari punya batas bawah DAN batas atas, inklusif, dan mengabaikan created_at NULL", () => {
    // CATATAN: ini test STRUKTURAL - ia mengunci TEKS predikat SQL dan
    // memastikan query benar-benar memakainya. Ia BUKAN pembuktian
    // perilaku: aturan tanggal hidup di dalam SQL, jadi tidak bisa
    // dijalankan tanpa database. Perilaku nyata (termasuk kasus
    // created_at di masa depan) diverifikasi oleh test integrasi yang
    // membutuhkan database uji.
    const window = RECENT_APPLICATION_WINDOW_SQL;

    assert.equal(RECENT_APPLICATION_DAYS, 7);
    assert.match(window, /a\.created_at IS NOT NULL/);
    assert.match(
      window,
      /a\.created_at >= DATE_SUB\(NOW\(\), INTERVAL 7 DAY\)/
    );
    // Batas atas: tanpa ini lamaran ber-created_at masa depan ikut terhitung
    // "terbaru" di backend, padahal isWithinDays() di frontend
    // (frontend/src/app/home/page.tsx:54-60) mengecualikannya.
    assert.match(window, /a\.created_at <= NOW\(\)/);

    // Predikatnya harus benar-benar terpakai di query, bukan cuma dideklarasikan.
    assert.ok(
      RECRUITER_TOTALS_QUERY.includes(window),
      "query total harus memakai predikat jendela yang sama"
    );
    assert.match(RECRUITER_TOTALS_QUERY, /recentCount/);
    assert.match(RECRUITER_TOTALS_QUERY, /unknownDateCount/);
    // created_at NULL tetap dihitung terpisah sebagai unknownDateCount.
    assert.match(
      RECRUITER_TOTALS_QUERY,
      /SUM\(CASE WHEN a\.created_at IS NULL THEN 1 ELSE 0 END\) AS unknownDateCount/
    );
  });

  it("tidak mengembalikan dashboard sukses saat database tidak terjangkau", async () => {
    const res = await callApi(`${server.baseUrl}/api/recruiter/dashboard`, {
      headers: authHeader(signToken("recruiter")),
    });

    // Kredensial DB pada proses test adalah placeholder yang pasti ditolak
    // MySQL, jadi endpoint tidak boleh membalas 200 dengan data rekaan.
    assert.notEqual(
      res.status,
      200,
      "endpoint tidak boleh mengembalikan dashboard sukses tanpa database sungguhan"
    );
    assert.equal(res.status, 500);
    assert.deepEqual(res.json, {
      success: false,
      message: "Terjadi kesalahan server",
    });
  });

  function jobRow(
    over: Partial<RecruiterDashboardJobRow> = {}
  ): RecruiterDashboardJobRow {
    return {
      id: 1,
      title: "Frontend Developer",
      company: "Tokopedia",
      location: "Jakarta",
      created_at: "2026-10-01 10:00:00",
      applicationCount: 0,
      pending: 0,
      reviewed: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
      ...over,
    };
  }

  it("bentuk respons: tanpa lowongan -> summary nol dan breakdown status lengkap", () => {
    const payload = buildRecruiterDashboard([], {});

    assert.equal(payload.success, true);
    assert.equal(typeof payload.message, "string");
    assert.equal(typeof payload.generatedAt, "string");
    assert.equal(Number.isNaN(Date.parse(payload.generatedAt)), false);

    assert.equal(payload.summary.totalJobs, 0);
    assert.equal(payload.summary.totalApplications, 0);
    assert.equal(payload.summary.recentApplications, 0);
    assert.equal(payload.summary.unknownDateCount, 0);

    assert.deepEqual(payload.statusBreakdown, {
      pending: 0,
      reviewed: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    });
    assert.deepEqual(payload.jobs, []);
  });

  it("bentuk respons: total pelamar & sebaran status dijumlahkan dari seluruh lowongan", () => {
    const payload = buildRecruiterDashboard(
      [
        jobRow({ id: 1, applicationCount: 3, pending: 2, reviewed: 1 }),
        jobRow({ id: 2, applicationCount: 1, accepted: 1 }),
        jobRow({ id: 3, applicationCount: 0 }),
      ],
      { recentCount: 2, unknownDateCount: 1 }
    );

    assert.equal(payload.summary.totalJobs, 3);
    assert.equal(payload.summary.totalApplications, 4);
    assert.equal(payload.summary.recentApplications, 2);
    assert.equal(payload.summary.unknownDateCount, 1);

    assert.deepEqual(payload.statusBreakdown, {
      pending: 2,
      reviewed: 1,
      interview: 0,
      accepted: 1,
      rejected: 0,
    });

    assert.equal(payload.jobs.length, 3);
    assert.equal(payload.jobs[0].id, 1);
    assert.equal(payload.jobs[0].title, "Frontend Developer");
    assert.equal(payload.jobs[0].company, "Tokopedia");
    assert.equal(payload.jobs[0].location, "Jakarta");
    assert.equal(payload.jobs[0].applicationCount, 3);
    assert.deepEqual(payload.jobs[0].statusBreakdown, {
      pending: 2,
      reviewed: 1,
      interview: 0,
      accepted: 0,
      rejected: 0,
    });
    assert.equal(payload.jobs[2].applicationCount, 0);
  });

  it("bentuk respons: nilai string dari mysql2 dan created_at dinormalisasi ke tipe stabil", () => {
    // mysql2 mengembalikan SUM() sebagai string, dan TIMESTAMP sebagai Date.
    const payload = buildRecruiterDashboard(
      [
        jobRow({
          id: 7,
          applicationCount: "2",
          pending: "1",
          created_at: new Date("2026-10-01T03:04:05.000Z"),
        }),
      ],
      { recentCount: "3", unknownDateCount: null }
    );

    assert.equal(typeof payload.summary.totalApplications, "number");
    assert.equal(payload.summary.totalApplications, 2);
    assert.equal(typeof payload.statusBreakdown.pending, "number");
    assert.equal(payload.statusBreakdown.pending, 1);
    assert.equal(payload.summary.recentApplications, 3);
    assert.equal(payload.summary.unknownDateCount, 0);
    assert.equal(typeof payload.jobs[0].created_at, "string");
    assert.equal(payload.jobs[0].created_at, "2026-10-01T03:04:05.000Z");
    assert.deepEqual(Object.keys(payload.statusBreakdown).sort(), [
      "accepted",
      "interview",
      "pending",
      "rejected",
      "reviewed",
    ]);
  });
});
