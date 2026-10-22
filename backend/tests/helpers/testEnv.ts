import fs from "fs";
import os from "os";
import path from "path";

/**
 * Environment untuk proses pengujian.
 *
 * WAJIB di-import SEBELUM modul aplikasi apa pun yang membaca
 * `process.env` pada saat module load:
 *   - middleware/authMiddleware.ts  -> JWT_SECRET
 *   - middleware/authorizeMiddleware.ts (tidak, tapi tetap aman)
 *   - config/database.ts            -> DB_*
 *   - config/config.ts              -> CV_DIR
 *   - controllers/authController.ts -> JWT_SECRET
 *
 * Isolasi: `node --test` menjalankan setiap file test pada PROSES SENDIRI,
 * jadi perubahan env di sini tidak pernah menyentuh server dev yang sedang
 * berjalan. Nilai yang di-set di bawah berlaku hanya untuk proses test.
 */

/**
 * Secret JWT khusus pengujian - nilai tetap dan bukan rahasia produksi.
 * Dipakai untuk menandatangani DAN memverifikasi token dalam proses test,
 * sehingga secret produksi tidak pernah dipakai, tidak pernah ditulis ke
 * source test, dan tidak pernah dicetak.
 */
export const TEST_JWT_SECRET = "jobtrack-test-secret-bukan-produksi";

/**
 * Direktori upload CV khusus pengujian (di dalam temp OS, di luar repo dan
 * di luar folder CV produksi). Middleware upload membuat folder ini saat
 * modulnya di-import; test tidak pernah mengunggah file pada Fase 0B.
 */
export const TEST_CV_DIR = path.join(
  os.tmpdir(),
  `jobtrack-test-cv-${process.pid}`
);

process.env.JWT_SECRET = TEST_JWT_SECRET;

/**
 * Kredensial database placeholder - BUKAN kredensial produksi.
 *
 * Host memakai TLD `.invalid` (RFC 2606) yang tidak seharusnya di-resolve.
 * Di lingkungan ini resolver lokal ternyata memetakannya ke loopback, jadi
 * proteksi sesungguhnya ada pada KREDENSIAL: user/password placeholder pasti
 * ditolak MySQL dengan `ER_ACCESS_DENIED_ERROR`.
 *
 * Konsekuensinya: kalau ada skenario yang ternyata menjalankan query DB,
 * responsnya menjadi 500 (akses ditolak) BUKAN 4xx yang diharapkan - test
 * pun gagal keras, bukan lolos diam-diam. Semua skenario L1 pada suite ini
 * karena itu terbukti tidak menyentuh database dan tidak menulis apa pun.
 */
process.env.DB_HOST = "db-tidak-ada.invalid";
process.env.DB_USER = "jobtrack_test";
process.env.DB_PASSWORD = "placeholder-bukan-password";
process.env.DB_NAME = "jobtrack_test_db";

/** Isolasi folder upload CV produksi. */
process.env.CV_DIR = TEST_CV_DIR;

/** Jumlah file yang tersimpan di folder upload CV pengujian (harus 0). */
export function uploadedCvFileCount(): number {
  try {
    return fs.readdirSync(TEST_CV_DIR).length;
  } catch {
    return 0;
  }
}

/** Membersihkan folder upload CV pengujian. */
export function cleanupTestCvDir(): void {
  try {
    fs.rmSync(TEST_CV_DIR, { recursive: true, force: true });
  } catch {
    // diamkan: pembersihan bersifat best-effort di folder temp
  }
}

// Folder upload CV pengujian dibuat oleh middleware upload saat modulnya
// di-import. Bersihkan saat proses test selesai supaya tidak ada sisa folder
// kosong di temp OS.
process.on("exit", cleanupTestCvDir);
