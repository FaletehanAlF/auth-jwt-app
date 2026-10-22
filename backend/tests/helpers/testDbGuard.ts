/**
 * Guard database uji - LAPIS 1 (statis, tanpa koneksi database).
 *
 * Tujuan: memastikan proses pengujian tidak pernah mengarah ke database
 * development/production. Fails CLOSED: kalau nama database tidak bisa
 * diverifikasi, proses harus BERHENTI, bukan melanjutkan dengan tebakan.
 *
 * Kapan guard ini WAJIB dipanggil:
 *   Dipanggil oleh `tests/helpers/integrationBootstrap.ts` yang dijamin
 *   berurutan: lapis 1 SEBELUM ada import yang menarik `config/database.ts`
 *   (modul itu membuat pool dari env saat di-load; kalau pool sudah
 *   terlanjur dibuat, `DB_NAME` sudah terkunci dan guard hanya bisa
 *   melaporkan, bukan mencegah), lapis 2 SETELAH app dimuat dan SEBELUM
 *   skenario mana pun berjalan, pada pool yang sama dengan yang dipakai app.
 *
 * Lapis 2 (verifikasi `SELECT DATABASE()` di server) ada di bagian bawah
 * file ini. Helper-nya tidak pernah membuka koneksi sendiri - pool
 * disuntikkan sebagai parameter - dan hanya dieksekusi terhadap database
 * sungguhan lewat jalur `test:integration` (entry:
 * `tests/integration/dashboard.test.ts`), bukan oleh `npm test`.
 *
 * Catatan keamanan: pesan error di bawah hanya menyebut NAMA database
 * (nama bukan rahasia). Host, username, password, DSN, dan keseluruhan
 * `process.env` TIDAK PERNAH dicetak.
 */

/**
 * Pola nama database uji yang disetujui.
 *
 * Sengaja TIDAK memakai "berakhiran _test" saja: pola longgar itu akan
 * menerima `auth_db_test` (mirip `auth_db`, mudah disalahartikan) dan
 * `production_test`. Pola ini hanya menerima nama yang jelas milik JobTrack.
 */
export const TEST_DB_NAME_PATTERN = /^jobtrack_(test|ci)(_[a-z0-9_]+)?$/;

/** True bila `name` adalah nama database uji yang diizinkan. */
export function isAllowedTestDatabaseName(name: unknown): boolean {
  return typeof name === "string" && TEST_DB_NAME_PATTERN.test(name);
}

/**
 * Validasi nama database uji. Melempar Error bila tidak diizinkan.
 * Mengembalikan nama yang lolos validasi.
 *
 * Tidak ada fallback ke database development: nama yang tidak ada / kosong /
 * tidak cocok pola semuanya ditolak.
 *
 * Catatan: fungsi ini TIDAK punya nilai default. Nilai `undefined` yang
 * sengaja diberikan harus DITOLAK, bukan diam-diam diganti nilai dari env.
 */
export function assertTestDatabaseName(name: unknown): string {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error(
      "Guard database uji: DB_NAME belum diisi. Setel DB_NAME ke nama database " +
        `uji yang cocok pola ${TEST_DB_NAME_PATTERN.source} (mis. ` +
        "DB_NAME=jobtrack_test) sebelum menjalankan test integrasi. " +
        "Tidak ada fallback ke database development/production."
    );
  }

  if (!isAllowedTestDatabaseName(name)) {
    throw new Error(
      `Guard database uji: nama database "${name}" tidak diizinkan. ` +
        `Hanya nama yang cocok pola ${TEST_DB_NAME_PATTERN.source} yang boleh ` +
        "dipakai untuk pengujian. Database development/production tidak boleh " +
        "disentuh oleh test."
    );
  }

  return name;
}

/**
 * Membaca `process.env.DB_NAME` pada saat dipanggil (bukan saat modul
 * di-import), lalu memvalidasinya. Ini yang dipanggil entry point test
 * integrasi.
 */
export function assertTestDatabaseSelected(): string {
  return assertTestDatabaseName(process.env.DB_NAME);
}

/* ==================================================================
 * LAPIS 2 - verifikasi database aktif di server.
 *
 * Helper ini BELUM pernah dipanggil terhadap database sungguhan, dan
 * SENGAJA TIDAK mengimpor modul pool: bentuk pool disuntikkan sebagai
 * parameter, sehingga mengimpor file ini tidak pernah membuat koneksi
 * dan tidak pernah menyentuh `config/database.ts`.
 *
 * PENTING: nama database yang lolos allowlist lapis 1 BUKAN bukti bahwa
 * database itu benar-benar ada atau aman. Yang membuktikan itu hanya
 * `SELECT DATABASE()` - dan itu diperiksa di sini.
 * ================================================================== */

/**
 * Bandingkan nama database. MySQL membedakan besar-kecil nama database di
 * Linux tapi tidak di Windows, jadi perbandingan dinormalisasi agar tidak
 * false-fail di salah satu platform.
 */
export function sameDatabaseName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Bentuk minimum pool yang dibutuhkan helper ini (tanpa mengimpor driver). */
export type DatabaseProbe = {
  execute(sql: string): Promise<[unknown, unknown]>;
};

/**
 * Verifikasi database yang sedang aktif pada koneksi yang DIPAKAI test
 * integrasi, lalu cocokkan dengan nama yang sudah disetujui guard lapis 1.
 *
 * Melempar Error (fail closed) bila: query gagal, `DATABASE()` kosong, atau
 * nama yang aktif tidak sama dengan yang diharapkan.
 */
export async function verifyActiveDatabase(
  pool: DatabaseProbe,
  expected: string
): Promise<string> {
  let rows: unknown;
  try {
    const result = await pool.execute("SELECT DATABASE() AS activeDatabase");
    rows = result[0];
  } catch {
    throw new Error(
      "Guard database uji lapis 2: query verifikasi database aktif gagal. " +
        "Test integrasi dihentikan - tidak ada konfirmasi database mana yang dipakai."
    );
  }

  const list = Array.isArray(rows)
    ? (rows as Array<{ activeDatabase?: unknown }>)
    : [];
  const active = list[0]?.activeDatabase;

  if (typeof active !== "string" || active.trim() === "") {
    throw new Error(
      "Guard database uji lapis 2: database aktif tidak dapat diverifikasi " +
        "(DATABASE() kosong). Test integrasi dihentikan."
    );
  }

  if (!sameDatabaseName(active, expected)) {
    throw new Error(
      `Guard database uji lapis 2: database aktif "${active}" tidak sama ` +
        `dengan database uji yang disetujui "${expected}". ` +
        "Test integrasi dihentikan."
    );
  }

  return active;
}
