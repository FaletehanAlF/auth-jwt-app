// WAJIB import pertama: menyiapkan env test sebelum modul aplikasi diimpor.
import "./helpers/testEnv";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, type TestServer } from "./helpers/server";
import { callApi, jsonInit } from "./helpers/http";
import { signToken, authHeader } from "./helpers/token";
import { uploadedCvFileCount } from "./helpers/testEnv";
import {
  assertTestDatabaseName,
  assertTestDatabaseSelected,
  isAllowedTestDatabaseName,
  TEST_DB_NAME_PATTERN,
} from "./helpers/testDbGuard";

const recruiter = authHeader(signToken("recruiter"));
const jobseeker = authHeader(signToken("jobseeker"));

let server: TestServer;

before(async () => {
  server = await startTestServer();
});

after(async () => {
  await server.close();
});

/**
 * Guard database uji - lapis 1 (statis, tanpa koneksi database).
 *
 * Guard sudah dipasang pada jalur test integrasi melalui
 * `tests/helpers/integrationBootstrap.ts` (dipakai entry point
 * `tests/integration/dashboard.test.ts`): lapis 1 berjalan sebelum modul
 * app/pool diimpor, lapis 2 memverifikasi `SELECT DATABASE()` pada pool
 * yang dipakai app. `npm test` SENGAJA tidak menyertakan jalur integrasi
 * dan tetap memakai kredensial placeholder; test di bawah menjalankan
 * logika guard secara unit, tanpa koneksi database.
 */
describe("guard database uji (lapis 1 - statis, tanpa koneksi)", () => {
  const ALLOWED = [
    "jobtrack_test",
    "jobtrack_ci",
    "jobtrack_test_regresi",
    "jobtrack_test_1",
  ];

  const REJECTED = [
    "auth_db",
    "auth_db_test",
    "production",
    "production_test",
    "test",
    "jobtrack",
    "jobtrack_production",
    "JOBTRACK_TEST",
    "jobtrack-test",
    "jobtrack_test!",
    "",
    "   ",
  ];

  it("pola yang disetujui hanya menerima nama database uji milik JobTrack", () => {
    assert.equal(TEST_DB_NAME_PATTERN.source, "^jobtrack_(test|ci)(_[a-z0-9_]+)?$");
    for (const name of ALLOWED) {
      assert.equal(isAllowedTestDatabaseName(name), true, `${name} harus diizinkan`);
    }
    for (const name of REJECTED) {
      assert.equal(
        isAllowedTestDatabaseName(name),
        false,
        `${name} harus DITOLAK`
      );
    }
  });

  it("nilai kosong / bukan string ditolak (gagal tertutup)", () => {
    for (const value of [undefined, null, 0, 123, {}, [], true]) {
      assert.equal(isAllowedTestDatabaseName(value), false);
      assert.throws(
        () => assertTestDatabaseName(value),
        /DB_NAME belum diisi/,
        "nilai kosong harus ditolak dengan pesan yang jelas"
      );
    }
  });

  it("nama database development/production ditolak dan tidak ada fallback", () => {
    for (const name of REJECTED.filter((n) => n.trim() !== "")) {
      assert.throws(
        () => assertTestDatabaseName(name),
        /tidak diizinkan/,
        `${name} harus ditolak`
      );
    }
    // Tidak boleh ada jalur yang "meneruskan" nama yang tidak diizinkan.
    assert.throws(() => assertTestDatabaseName("auth_db"), /tidak diizinkan/);
  });

  it("nama yang diizinkan dikembalikan apa adanya", () => {
    for (const name of ALLOWED) {
      assert.equal(assertTestDatabaseName(name), name);
    }
  });

  it("pesan error tidak pernah membocorkan host, user, password, atau process.env", () => {
    const secrets = [
      process.env.DB_HOST,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      process.env.JWT_SECRET,
    ].filter((v): v is string => typeof v === "string" && v.length > 0);

    for (const name of ["auth_db", "production_test"]) {
      let message = "";
      try {
        assertTestDatabaseName(name);
      } catch (error) {
        message = (error as Error).message;
      }
      assert.ok(message.length > 0, "harus ada pesan error");
      assert.equal(message.includes("process.env"), false);
      assert.equal(/\bprocess\.env\b/.test(message), false);
      for (const secret of secrets) {
        assert.equal(
          message.includes(secret),
          false,
          `pesan error tidak boleh memuat nilai rahasia`
        );
      }
    }
  });

  it("membaca process.env.DB_NAME saat dipanggil, dan menolak nama yang disetel di luar pola", () => {
    const original = process.env.DB_NAME;
    try {
      process.env.DB_NAME = "auth_db";
      assert.throws(() => assertTestDatabaseSelected(), /tidak diizinkan/);

      process.env.DB_NAME = "jobtrack_test";
      assert.equal(assertTestDatabaseSelected(), "jobtrack_test");

      delete process.env.DB_NAME;
      assert.throws(() => assertTestDatabaseSelected(), /DB_NAME belum diisi/);
    } finally {
      if (original === undefined) delete process.env.DB_NAME;
      else process.env.DB_NAME = original;
    }
    assert.equal(process.env.DB_NAME, original);
  });
});

describe("L1 - validasi request (tanpa database)", () => {
  it("POST /register dengan body kosong -> 400 + pesan kontrak", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/register`,
      jsonInit("POST", {})
    );
    assert.equal(res.status, 400);
    const body = res.json as {
      success: boolean;
      message: string;
      errors: Record<string, string[]>;
    };
    assert.equal(body.success, false);
    assert.equal(body.message, "Data register tidak valid");
    assert.deepEqual(Object.keys(body.errors).sort(), [
      "email",
      "name",
      "password",
    ]);
  });

  it("POST /register dengan nilai tidak valid -> 400 + pesan validasi per field", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/register`,
      jsonInit("POST", { name: "abc", email: "bukan-email", password: "123" })
    );
    assert.equal(res.status, 400);
    const body = res.json as {
      message: string;
      errors: Record<string, string[]>;
    };
    assert.equal(body.message, "Data register tidak valid");
    assert.deepEqual(body.errors, {
      name: ["Nama minimal 5 karakter"],
      email: ["Format email tidak valid"],
      password: ["Password minimal 6 karakter"],
    });
  });

  it("POST /login dengan body kosong -> 400 + pesan kontrak", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/login`,
      jsonInit("POST", {})
    );
    assert.equal(res.status, 400);
    const body = res.json as {
      message: string;
      errors: Record<string, string[]>;
    };
    assert.equal(body.message, "Data login tidak valid");
    assert.deepEqual(Object.keys(body.errors).sort(), ["email", "password"]);
  });

  it("POST /login dengan nilai tidak valid -> 400 + pesan validasi per field", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/login`,
      jsonInit("POST", { email: "bukan-email", password: "123" })
    );
    assert.equal(res.status, 400);
    const body = res.json as { errors: Record<string, string[]> };
    assert.deepEqual(body.errors, {
      email: ["Format email tidak valid"],
      password: ["Password minimal 6 karakter"],
    });
  });

  it("POST /auth/forgot-password dengan email tidak valid -> 400 tanpa mengirim email", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/auth/forgot-password`,
      jsonInit("POST", { email: "bukan-email" })
    );
    assert.equal(res.status, 400);
    const body = res.json as {
      message: string;
      errors: Record<string, string[]>;
    };
    assert.equal(body.message, "Data tidak valid");
    assert.deepEqual(body.errors, { email: ["Format email tidak valid"] });
    // Bukti email tidak dikirim: handler tidak pernah dieksekusi (zod menolak
    // lebih dulu). Email valid akan lewat ke query DB, yang di proses test
    // tidak bisa dijangkau - hasilnya 500, bukan 400.
  });

  it("POST /auth/reset-password dengan token terlalu pendek -> 400 tanpa mengubah database", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/auth/reset-password`,
      jsonInit("POST", { token: "pendek", password: "rahasia123" })
    );
    assert.equal(res.status, 400);
    const body = res.json as {
      message: string;
      errors: Record<string, string[]>;
    };
    assert.equal(body.message, "Data tidak valid");
    assert.deepEqual(body.errors, { token: ["Token tidak valid"] });
  });

  it("POST /auth/reset-password dengan password pendek -> 400 + pesan validasi", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/auth/reset-password`,
      jsonInit("POST", { token: "a".repeat(40), password: "123" })
    );
    assert.equal(res.status, 400);
    const body = res.json as { errors: Record<string, string[]> };
    assert.deepEqual(body.errors, { password: ["Password minimal 6 karakter"] });
  });

  it("POST /jobs tanpa field wajib -> 400 + pesan kontrak", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/jobs`,
      jsonInit("POST", {}, recruiter)
    );
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, {
      success: false,
      message: "Title wajib diisi",
    });
  });

  it("PUT /jobs/:id tanpa field wajib -> 400 + pesan kontrak", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/jobs/1`,
      jsonInit("PUT", {}, recruiter)
    );
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, {
      success: false,
      message: "Title wajib diisi",
    });
  });

  it("PATCH /applications/:id dengan status di luar whitelist -> 400 + pesan kontrak", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/applications/1`,
      jsonInit("PATCH", { status: "ngawur" }, recruiter)
    );
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, {
      success: false,
      message:
        "Status tidak valid. Nilai yang diterima: pending, reviewed, interview, accepted, rejected.",
    });
  });

  it("GET /insights dengan range tidak valid -> 400 + pesan kontrak", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/insights?range=bogus`,
      { headers: jobseeker }
    );
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, {
      success: false,
      message:
        "Parameter range tidak valid. Nilai yang diterima: 7d, 30d, 90d, all.",
    });
  });

  it("GET /insights dengan limit tidak valid -> 400 + pesan kontrak", async () => {
    for (const limit of ["abc", "0", "11", "1.5"]) {
      const res = await callApi(
        `${server.baseUrl}/api/insights?limit=${limit}`,
        { headers: jobseeker }
      );
      assert.equal(res.status, 400, `limit=${limit}`);
      assert.deepEqual(res.json, {
        success: false,
        message:
          "Parameter limit tidak valid. Gunakan bilangan bulat antara 1 dan 10.",
      });
    }
  });

  it("PUT /profile/avatar dengan URL di luar Cloudinary -> 400 + pesan kontrak", async () => {
    const res = await callApi(
      `${server.baseUrl}/api/profile/avatar`,
      jsonInit("PUT", { avatarUrl: "https://evil.example/x.png" }, jobseeker)
    );
    assert.equal(res.status, 400);
    const body = res.json as {
      message: string;
      errors: Record<string, string[]>;
    };
    assert.equal(body.message, "URL foto profil tidak valid");
    assert.deepEqual(body.errors, {
      avatarUrl: ["URL harus berasal dari Cloudinary"],
    });
  });

  it("POST /jobs/:id/apply tanpa file CV -> 400 + pesan kontrak, tanpa menulis file", async () => {
    const before = uploadedCvFileCount();

    // Body multipart dengan field "cv" berupa TEKS (bukan file).
    // Multer tidak menyimpan apa pun, jadi req.file undefined.
    const boundary = "----jobtrackTestBoundary";
    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="cv"\r\n\r\n` +
      `bukan-file\r\n` +
      `--${boundary}--\r\n`;

    const res = await callApi(`${server.baseUrl}/api/jobs/1/apply`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        ...jobseeker,
      },
      body: multipartBody,
    });

    assert.equal(res.status, 400);
    assert.deepEqual(res.json, {
      success: false,
      message: "CV wajib diunggah dalam format PDF.",
    });
    assert.equal(
      uploadedCvFileCount(),
      before,
      "Upload CV tidak boleh menulis file pada test ini"
    );
  });
});
