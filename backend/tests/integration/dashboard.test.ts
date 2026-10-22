/**
 * Entry point test INTEGRASI JobTrack - jalur `npm run test:integration`,
 * terpisah dari `npm test` (suite statis yang SELALU tanpa database).
 *
 * ATURAN KERAS untuk file ini dan file test integrasi berikutnya:
 *   1. Tidak boleh import `../helpers/server`, `../helpers/testEnv`, atau
 *      modul apa pun yang menarik `../app` / `../config/database` secara
 *      statis. `config/database` membuat pool sebelum guard berjalan dan
 *      `testEnv` menimpa env dengan kredensial placeholder - keduanya
 *      merusak urutan proteksi bootstrap. Catatan: `helpers/token` juga
 *      menarik `testEnv`, jadi belum bisa dipakai di jalur ini sampai
 *      sumber env integrasi ditetapkan pada tahap penyediaan database.
 *   2. App, pool, dan server hanya diambil lewat `bootstrapIntegration()`
 *      + `startIntegrationServer()`. Di dalamnya: guard lapis 1 (nama
 *      database, fail closed) -> cek modul app/pool belum ter-load ->
 *      muat app -> guard lapis 2 (`SELECT DATABASE()` pada pool yang sama).
 *      Gagal di langkah mana pun = file test gagal SEBELUM skenario mana
 *      pun berjalan.
 *
 * STATUS TAHAP INI: database uji, akun MySQL khusus, schema, dan fixture
 * BELUM disediakan (tahap berikutnya), jadi helper guard sengaja TIDAK
 * dijalankan terhadap database sungguhan. Satu-satunya skenario yang sah
 * untuk sekarang adalah cek kesehatan lintas wire yang tidak menyentuh
 * database - sebagai bukti jalur ini nyata dan terlindungi, bukan test
 * palsu. Skenario dashboard (memakai database + fixture) ditambahkan DI
 * FILE INI setelah penyediaan, tetap mematuhi aturan (1).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  bootstrapIntegration,
  closeIntegrationDatabase,
  resetIntegrationContext,
  startIntegrationServer,
  type IntegrationContext,
  type IntegrationServer,
} from "../helpers/integrationBootstrap";
import { callApi } from "../helpers/http";

let context: IntegrationContext | null = null;
let server: IntegrationServer | null = null;

before(async () => {
  // Guard lapis 1 + lapis 2 + muat app berjalan di sini, secara terurut.
  context = await bootstrapIntegration();
  server = await startIntegrationServer(context);
});

after(async () => {
  if (server) {
    await server.close();
    server = null;
  }
  resetIntegrationContext();
});

describe("jalur integrasi terlindungi guard database", () => {
  after(async () => {
    // Pool ditutup setelah suite agar proses test tidak menggantung.
    await closeIntegrationDatabase();
  });

  it("menjawab request HTTP nyata setelah kedua lapis guard lulus, tanpa query database", async () => {
    assert.ok(context, "konteks integrasi harus sudah disiapkan oleh before()");
    assert.ok(server, "server integrasi harus sudah berjalan");

    // GET / adalah health check aplikasi (lihat app.ts) dan tidak
    // menyentuh database, jadi skenario ini sah meski database uji belum
    // tersedia. Terpenting: ia hanya bisa berjalan SETELAH guard lapis 1
    // menyetujui nama database dan guard lapis 2 memverifikasi
    // `SELECT DATABASE()` pada pool yang sama dengan yang dipakai app.
    const res = await callApi(`${server.baseUrl}/`);

    assert.equal(res.status, 200);
    assert.equal((res.json as { success?: boolean } | undefined)?.success, true);
  });
});
