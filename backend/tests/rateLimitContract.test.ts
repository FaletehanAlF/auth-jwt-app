// WAJIB import pertama: menyiapkan env test sebelum modul aplikasi diimpor.
import "./helpers/testEnv";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, type TestServer } from "./helpers/server";
import { callApi, jsonInit } from "./helpers/http";

/**
 * Rate limiter disimpan di memori per proses (middleware/rateLimit.ts) dan
 * dibatasi per `ip:path`. Karena itu file ini dipisah dari file test lain
 * supaya pemakaian bucket-nya tidak saling memengaruhi.
 *
 * Penting: `node --test` menjalankan tiap file test pada proses terpisah,
 * sehingga bucket rate limit di file ini terisolasi dari file lain.
 */

let server: TestServer;

before(async () => {
  server = await startTestServer();
});

after(async () => {
  await server.close();
});

describe("L1 - rate limiter pada route auth publik", () => {
  it("forgot-password: 5 permintaan lolos, ke-6 -> 429 + pesan kontrak", async () => {
    const url = `${server.baseUrl}/api/auth/forgot-password`;

    for (let i = 1; i <= 5; i++) {
      const res = await callApi(url, jsonInit("POST", { email: "bukan-email" }));
      assert.equal(res.status, 400, `permintaan ke-${i} harus 400`);
    }

    const sixth = await callApi(url, jsonInit("POST", { email: "bukan-email" }));
    assert.equal(sixth.status, 429);
    assert.deepEqual(sixth.json, {
      success: false,
      message: "Terlalu banyak permintaan reset. Coba lagi nanti.",
    });
  });

  it("reset-password: 10 permintaan lolos, ke-11 -> 429 + pesan kontrak", async () => {
    const url = `${server.baseUrl}/api/auth/reset-password`;
    const body = { token: "pendek", password: "rahasia123" };

    for (let i = 1; i <= 10; i++) {
      const res = await callApi(url, jsonInit("POST", body));
      assert.equal(res.status, 400, `permintaan ke-${i} harus 400`);
    }

    const eleventh = await callApi(url, jsonInit("POST", body));
    assert.equal(eleventh.status, 429);
    assert.deepEqual(eleventh.json, {
      success: false,
      message: "Terlalu banyak percobaan. Coba lagi nanti.",
    });
  });
});
