import http from "http";
import type { AddressInfo } from "net";
import type { Express } from "express";

export type TestServer = {
  baseUrl: string;
  port: number;
  close: () => Promise<void>;
};

/**
 * Varian `../helpers/server.ts` khusus jalur test integrasi.
 *
 * FILE INI TIDAK BOLEH meng-import `../../app` (maupun modul lain yang
 * menarik `config/database.ts`). `helpers/server.ts` meng-import app
 * secara statis, jadi file test integrasi yang meng-import file itu akan
 * memuat app (dan membuat pool database) SEBELUM guard berjalan - persis
 * kesalahan yang dicegah `bootstrapIntegration()`.
 *
 * Karena itu app DILEMPAR sebagai parameter: instance ini berasal dari
 * `bootstrapIntegration()` yang baru me-load app SETELAH guard lapis 1
 * lulus. Semantik lain identik dengan helpers/server.ts: listen(0)
 * (port ephemeral loopback), socket ditutup kembali di akhir test.
 */
export async function startTestServerWithApp(app: Express): Promise<TestServer> {
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
