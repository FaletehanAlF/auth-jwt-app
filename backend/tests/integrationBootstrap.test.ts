// WAJIB import pertama: menyiapkan env test sebelum modul aplikasi diimpor.
import "./helpers/testEnv";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
import fs from "node:fs";
import path from "path";

import {
  APP_MODULE_PATH,
  DATABASE_MODULE_PATH,
  bootstrapIntegration,
  resetIntegrationContext,
} from "./helpers/integrationBootstrap";
import {
  sameDatabaseName,
  verifyActiveDatabase,
  type DatabaseProbe,
} from "./helpers/testDbGuard";

const requireModule = createRequire(__filename);

/**
 * Test bootstrap integrasi - TIDAK membutuhkan koneksi database.
 *
 * File ini SENGAJA tidak meng-import `../app` maupun `./helpers/server`:
 * kalau salah import, modul app (dan pool database) akan ter-load sebelum
 * guard berjalan - persis kesalahan yang harus dicegah. Semua import di
 * file ini hanya menyentuh helper yang tidak memuat aplikasi.
 */
describe("bootstrap integrasi", () => {
  it("file test ini sendiri tidak memuat modul aplikasi", () => {
    assert.equal(
      requireModule.cache[APP_MODULE_PATH],
      undefined,
      "file test bootstrap tidak boleh memuat modul aplikasi"
    );
  });

  it("nama database yang tidak diizinkan ditolak dan modul aplikasi TIDAK dimuat", async () => {
    const original = process.env.DB_NAME;
    try {
      process.env.DB_NAME = "auth_db";
      await assert.rejects(
        () => bootstrapIntegration(),
        /tidak diizinkan/,
        "nama database development harus ditolak"
      );
      assert.equal(
        requireModule.cache[APP_MODULE_PATH],
        undefined,
        "modul aplikasi tidak boleh termuat saat guard menolak"
      );
      assert.equal(
        requireModule.cache[DATABASE_MODULE_PATH],
        undefined,
        "modul pool database tidak boleh termuat saat guard menolak"
      );

      process.env.DB_NAME = "production_test";
      await assert.rejects(() => bootstrapIntegration(), /tidak diizinkan/);
      assert.equal(requireModule.cache[APP_MODULE_PATH], undefined);
      assert.equal(requireModule.cache[DATABASE_MODULE_PATH], undefined);
    } finally {
      if (original === undefined) delete process.env.DB_NAME;
      else process.env.DB_NAME = original;
      resetIntegrationContext();
    }
  });

  it("nama database kosong ditolak dan modul aplikasi TIDAK dimuat", async () => {
    const original = process.env.DB_NAME;
    try {
      delete process.env.DB_NAME;
      await assert.rejects(() => bootstrapIntegration(), /DB_NAME belum diisi/);
      assert.equal(
        requireModule.cache[APP_MODULE_PATH],
        undefined,
        "modul aplikasi tidak boleh termuat saat guard menolak"
      );

      process.env.DB_NAME = "   ";
      await assert.rejects(() => bootstrapIntegration(), /DB_NAME belum diisi/);
      assert.equal(requireModule.cache[APP_MODULE_PATH], undefined);
      assert.equal(requireModule.cache[DATABASE_MODULE_PATH], undefined);
    } finally {
      if (original === undefined) delete process.env.DB_NAME;
      else process.env.DB_NAME = original;
      resetIntegrationContext();
    }
  });

  it("menolak modul aplikasi yang sudah ter-load lebih dulu (urutan import salah)", async () => {
    const original = process.env.DB_NAME;
    // Stub: membuktikan pemeriksaan "sudah ter-load" bekerja TANPA
    // menjalankan modul app sungguhan (tidak ada pool yang dibuat).
    const stub = { __esModule: true, default: { stub: true } };
    requireModule.cache[APP_MODULE_PATH] = stub as unknown as NodeModule;
    try {
      process.env.DB_NAME = "jobtrack_test";
      await assert.rejects(
        () => bootstrapIntegration(),
        /sudah ter-load/,
        "urutan import salah harus ditolak"
      );
    } finally {
      delete requireModule.cache[APP_MODULE_PATH];
      if (original === undefined) delete process.env.DB_NAME;
      else process.env.DB_NAME = original;
      resetIntegrationContext();
    }
    assert.equal(requireModule.cache[APP_MODULE_PATH], undefined);
  });

  it("menolak modul pool database yang sudah ter-load lebih dulu (urutan import salah)", async () => {
    const original = process.env.DB_NAME;
    // Stub: membuktikan pemeriksaan "config/database sudah ter-load" bekerja
    // TANPA memuat modul aslinya (tidak ada pool, tidak ada koneksi, tidak
    // ada dotenv). Config/database membuat pool saat di-load, sehingga jika
    // ternyata sudah ter-load guard hanya bisa melaporkan - dan harus
    // MENOLAK, bukan pura-pura mencegah.
    const stub = { __esModule: true, default: { stub: true } };
    requireModule.cache[DATABASE_MODULE_PATH] = stub as unknown as NodeModule;
    try {
      process.env.DB_NAME = "jobtrack_test";
      await assert.rejects(
        () => bootstrapIntegration(),
        /modul pool database.*sudah\s+ter-load/,
        "load config/database lebih dulu harus ditolak"
      );
      assert.equal(
        requireModule.cache[APP_MODULE_PATH],
        undefined,
        "modul aplikasi tidak boleh termuat saat guard menolak"
      );
    } finally {
      delete requireModule.cache[DATABASE_MODULE_PATH];
      if (original === undefined) delete process.env.DB_NAME;
      else process.env.DB_NAME = original;
      resetIntegrationContext();
    }
    assert.equal(requireModule.cache[DATABASE_MODULE_PATH], undefined);
  });
});

describe("guard lapis 2 (helper, diuji dengan pool tiruan - tanpa koneksi)", () => {
  function fakePool(result: unknown, shouldThrow = false): DatabaseProbe {
    return {
      execute: async (_sql: string) => {
        if (shouldThrow) throw new Error("koneksi ditolak");
        return [result, []] as [unknown, unknown];
      },
    };
  }

  it("menerima nama database yang sama dengan yang diharapkan", async () => {
    const active = await verifyActiveDatabase(
      fakePool([{ activeDatabase: "jobtrack_test" }]),
      "jobtrack_test"
    );
    assert.equal(active, "jobtrack_test");
  });

  it("menolak bila database aktif tidak sama dengan yang diharapkan", async () => {
    await assert.rejects(
      () =>
        verifyActiveDatabase(
          fakePool([{ activeDatabase: "auth_db" }]),
          "jobtrack_test"
        ),
      /tidak sama/
    );
  });

  it("menolak bila DATABASE() kosong atau tidak ada", async () => {
    await assert.rejects(
      () => verifyActiveDatabase(fakePool([{ activeDatabase: null }]), "jobtrack_test"),
      /tidak dapat diverifikasi/
    );
    await assert.rejects(
      () => verifyActiveDatabase(fakePool([]), "jobtrack_test"),
      /tidak dapat diverifikasi/
    );
    await assert.rejects(
      () => verifyActiveDatabase(fakePool([{ activeDatabase: "  " }]), "jobtrack_test"),
      /tidak dapat diverifikasi/
    );
  });

  it("menolak bila query verifikasi gagal", async () => {
    await assert.rejects(
      () => verifyActiveDatabase(fakePool([], true), "jobtrack_test"),
      /query verifikasi database aktif gagal/
    );
  });

  it("perbandingan nama database menormalisasi besar-kecil", () => {
    assert.equal(sameDatabaseName("JobTrack_Test", "jobtrack_test"), true);
    assert.equal(sameDatabaseName(" jobtrack_test ", "jobtrack_test"), true);
    assert.equal(sameDatabaseName("auth_db", "jobtrack_test"), false);
  });
});

describe("pemisahan jalur test", () => {
  it("npm test tidak menjalankan jalur integrasi, dan test:integration terpisah", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
    ) as { scripts: Record<string, string> };

    assert.ok(pkg.scripts.test, "skrip test harus ada");
    assert.ok(pkg.scripts["test:integration"], "skrip test:integration harus ada");
    assert.equal(
      pkg.scripts.test.includes("test:integration"),
      false,
      "skrip test tidak boleh memanggil skrip integrasi"
    );
    assert.equal(
      pkg.scripts.test.includes("tests/integration/"),
      false,
      "skrip test tidak boleh menyertakan file test integrasi"
    );
    assert.notEqual(pkg.scripts.test, pkg.scripts["test:integration"]);
    assert.ok(
      pkg.scripts["test:integration"].includes("tests/integration/"),
      "skrip test:integration harus menunjuk ke folder test integrasi"
    );
  });

  it("suite biasa memakai kredensial placeholder sehingga tidak bisa tersambung ke database development", () => {
    // testEnv.ts menimpa seluruh DB_* dengan placeholder; file ini tidak
    // pernah memuat modul aplikasi, jadi nilai .env pun tidak pernah masuk
    // ke proses test.
    assert.equal(process.env.DB_NAME, "jobtrack_test_db");
    assert.equal(process.env.DB_USER, "jobtrack_test");
    assert.equal(process.env.DB_PASSWORD, "placeholder-bukan-password");
    assert.equal(process.env.DB_HOST, "db-tidak-ada.invalid");
  });
});
