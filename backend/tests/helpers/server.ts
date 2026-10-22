// WAJIB import pertama: menyiapkan env test sebelum modul aplikasi diimpor.
import "./testEnv";
import http from "http";
import type { AddressInfo } from "net";
import app from "../../app";

export type TestServer = {
  baseUrl: string;
  port: number;
  close: () => Promise<void>;
};

/**
 * Menjalankan app Express di loopback dengan port ephemeral (listen(0)).
 *
 * Tidak membuka port permanen: dev server tetap jalan di port 5001 tanpa
 * terganggu, dan socket test ditutup kembali di akhir file test (termasuk
 * saat test gagal).
 */
export async function startTestServer(): Promise<TestServer> {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const { port } = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    port,
    close: () =>
      new Promise<void>((resolve, reject) => {
        // Tutup koneksi keep-alive agar close() tidak menggantung.
        server.closeAllConnections();
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
