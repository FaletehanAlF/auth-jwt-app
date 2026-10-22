// WAJIB import pertama: menyiapkan env test sebelum modul aplikasi diimpor.
import "./helpers/testEnv";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, type TestServer } from "./helpers/server";
import { callApi } from "./helpers/http";
import { authHeader, signToken } from "./helpers/token";

let server: TestServer;

before(async () => {
  server = await startTestServer();
});

after(async () => {
  await server.close();
});

const MALFORMED = { success: false, message: "Body JSON tidak valid" };

describe("L1 - penanganan error global", () => {
  it("JSON malformed pada route publik -> 400 + pesan kontrak", async () => {
    const res = await callApi(`${server.baseUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, MALFORMED);
  });

  it("JSON malformed pada route terlindungi -> 400, bukan 401", async () => {
    // express.json() berjalan SEBELUM verifyToken, jadi parser yang menolak
    // lebih dulu. Ini bagian dari kontrak dan harus tetap begitu.
    const res = await callApi(`${server.baseUrl}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ bukan json",
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, MALFORMED);
  });

  it("JSON malformed pada route dengan param -> 400 + pesan kontrak", async () => {
    const res = await callApi(`${server.baseUrl}/api/jobs/1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(signToken("recruiter")),
      },
      body: "}",
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.json, MALFORMED);
  });

  it("body JSON kosong / tanpa body tidak dianggap malformed", async () => {
    // Tanpa header Content-Type, express.json() melewati body -> request
    // mencapai lapisan validasi, bukan error parser.
    const res = await callApi(`${server.baseUrl}/api/register`, {
      method: "POST",
    });
    assert.equal(res.status, 400);
    const body = res.json as { message: string };
    assert.equal(body.message, "Data register tidak valid");
  });
});
