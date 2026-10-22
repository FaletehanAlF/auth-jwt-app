import http from "node:http";
import type { AddressInfo } from "net";
import { createRequire } from "module";

import {
  assertTestDatabaseSelected,
  verifyActiveDatabase,
  type DatabaseProbe,
} from "./testDbGuard";

/**
 * Bootstrap jalur test INTEGRASI (entry: `tests/integration/dashboard.test.ts`,
 * skrip `npm run test:integration`).
 *
 * ATURAN PEMAKAIAN FILE TEST INTEGRASI:
 *   File test integrasi TIDAK BOLEH meng-import `../../app`,
 *   `../helpers/server`, `../helpers/testEnv`, atau modul apa pun yang
 *   menarik `config/database` secara STATIS:
 *     - `config/database.ts` membuat pool database dari `process.env.DB_NAME`
 *       saat di-load, jadi import statis akan mengunci pool ke database yang
 *       salah SEBELUM guard sempat berjalan;
 *     - `testEnv.ts` menimpa env dengan kredensial placeholder suite statis,
 *       yang justru MENGHALANGI jalur integrasi memakai env database uji.
 *   Semua kebutuhan app/database hanya diambil lewat `bootstrapIntegration()`.
 *
 * Semua langkah proteksi dijalankan di dalam SATU fungsi supaya urutannya
 * tidak bergantung pada disiplin penulis file test:
 *   1. guard lapis 1  -> validasi nama database (fail closed, tanpa koneksi)
 *   2. cek app/pool belum ter-load -> menangkap "urutan import salah"
 *   3. muat modul app (pool baru lahir di sini)
 *   4. guard lapis 2  -> `SELECT DATABASE()` pada pool yang sama dengan yang
 *      dipakai app; gagal = fail closed, sebelum skenario mana pun berjalan.
 *
 * `require` dipakai, bukan `import()` dinamis: di bawah
 * `--require ts-node/register`, `import()` dimuat oleh ESM loader Node dan
 * import relatif tanpa ekstensi (gaya kode project ini) gagal dengan
 * ERR_MODULE_NOT_FOUND.
 */

const requireModule = createRequire(__filename);

/** Path modul app Express - dipakai untuk memeriksa dan memuat app. */
export const APP_MODULE_PATH = requireModule.resolve("../../app");
/** Path modul pool database - harus tidak ter-load sebelum guard lapis 1. */
export const DATABASE_MODULE_PATH = requireModule.resolve("../../config/database");

/** Hasil verifikasi database aktif pada pool yang dipakai test integrasi. */
export type IntegrationDatabase = {
  /** Pool yang sama dengan yang dipakai modul app. */
  pool: DatabaseProbe;
  /** Nama database yang sudah divalidasi guard lapis 1. */
  dbName: string;
  /** Hasil `SELECT DATABASE()` yang sama dengan nama yang disetujui. */
  activeDatabase: string;
};

export type IntegrationContext = {
  /** Nama database uji yang sudah divalidasi guard lapis 1. */
  dbName: string;
  /** Instance Express hasil memuat modul app. */
  app: unknown;
  /** Verifikasi guard lapis 2 pada pool yang dipakai app. */
  database: IntegrationDatabase;
};

let cached: IntegrationContext | null = null;

/**
 * Menolak kalau modul app ATAU pool database sudah ter-load sebelum guard
 * berjalan. Ini menangkap file test integrasi yang salah meng-import
 * app/pool secara statis.
 */
function assertProtectedModulesNotLoaded(): void {
  if (requireModule.cache[APP_MODULE_PATH]) {
    throw new Error(
      "Bootstrap integrasi: modul aplikasi sudah ter-load sebelum guard " +
        "berjalan. File test integrasi tidak boleh meng-import app atau " +
        "helper server secara statis - gunakan bootstrapIntegration() supaya " +
        "validasi nama database selalu berjalan lebih dulu."
    );
  }
  if (requireModule.cache[DATABASE_MODULE_PATH]) {
    throw new Error(
      "Bootstrap integrasi: modul pool database (config/database) sudah " +
        "ter-load sebelum guard berjalan, jadi pool sudah terlanjur dibuat " +
        "dan tidak bisa dicegah lagi. File test integrasi tidak boleh " +
        "meng-import config/database secara statis - gunakan " +
        "bootstrapIntegration()."
    );
  }
}

/**
 * Memuat modul pool database dan memverifikasi database aktifnya dengan
 * guard lapis 2. Dipanggil HANYA di dalam `bootstrapIntegration()`, sesudah
 * guard lapis 1 lulus.
 */
function loadIntegrationDatabase(dbName: string): Promise<IntegrationDatabase> {
  const loaded = requireModule(DATABASE_MODULE_PATH) as { default?: unknown };
  const pool = (loaded.default ?? loaded) as DatabaseProbe | undefined;

  if (!pool || typeof pool.execute !== "function") {
    throw new Error(
      "Bootstrap integrasi: modul config/database tidak mengekspos pool " +
        "dengan method execute() - default export harus tetap pool mysql2."
    );
  }

  return verifyActiveDatabase(pool, dbName).then((activeDatabase) => ({
    pool,
    dbName,
    activeDatabase,
  }));
}

/**
 * Menyiapkan konteks integrasi SELENGKAPNYA: guard lapis 1, pemeriksaan
 * urutan import, muat app, lalu guard lapis 2 - semuanya sebelum fungsi ini
 * kembali. Gagal di langkah mana pun membuat file test integrasi gagal tanpa
 * menjalankan skenario mana pun (fail closed).
 */
export async function bootstrapIntegration(): Promise<IntegrationContext> {
  if (cached) return cached;

  // 1. Guard lapis 1 (statis, tanpa koneksi) - SEBELUM app/pool diimpor.
  const dbName = assertTestDatabaseSelected();

  // 2. Pastikan tidak ada yang memuat app/pool lebih dulu (urutan import salah).
  assertProtectedModulesNotLoaded();

  // 3. Baru sekarang modul aplikasi (dan pool database) boleh dimuat.
  const loaded = requireModule(APP_MODULE_PATH) as { default?: unknown };
  const app = loaded.default ?? loaded;

  // 4. Guard lapis 2: database aktif harus cocok pada pool yang dipakai app.
  const database = await loadIntegrationDatabase(dbName);

  cached = { dbName, app, database };
  return cached;
}

/** Server loopback port ephemeral untuk suite integrasi (bukan port 5001). */
export type IntegrationServer = {
  baseUrl: string;
  port: number;
  close: () => Promise<void>;
};

/**
 * Menjalankan app hasil `bootstrapIntegration()` di loopback dengan port
 * ephemeral, persis pola `helpers/server.ts` tapi memakai app yang dimuat
 * secara TERTUNDA (setelah guard lulus), bukan app hasil import statis.
 */
export async function startIntegrationServer(
  context: IntegrationContext
): Promise<IntegrationServer> {
  const server = http.createServer(context.app as http.RequestListener);

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

/**
 * Menutup pool database integrasi di akhir suite supaya proses test tidak
 * menggantung pada koneksi yang masih terbuka. Aman dipanggil kapan pun:
 * NO-OP saat bootstrap belum lulus / pool tidak punya `end()`.
 */
export async function closeIntegrationDatabase(): Promise<void> {
  const pool = cached?.database.pool as
    | (DatabaseProbe & { end?: () => Promise<unknown> })
    | undefined;
  if (!pool || typeof pool.end !== "function") return;
  await pool.end();
}

/** Mengosongkan cache konteks (dipakai test; dipakai juga di test saja). */
export function resetIntegrationContext(): void {
  cached = null;
}
