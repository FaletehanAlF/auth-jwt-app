// Statistik untuk section "Tentang JobTrack" pada landing page.
//
// SUMBER DATA — PENTING:
// Backend JobTrack belum menyediakan sumber statistik publik. Seluruh endpoint
// data (lihat backend/routes.ts) dilindungi `verifyToken`:
//   GET /api/jobs                  -> butuh token
//   GET /api/recruiter/jobs        -> butuh token + role recruiter
//   GET /api/applications/me       -> butuh token
//   GET /api/jobs/:id/applications -> butuh token + role recruiter
// dan tidak ada endpoint hitung agregat (jumlah user/lowongan/lamaran).
// Karena tugas ini juga melarang menambah endpoint atau mengubah skema
// database, landing page (publik, tanpa login) tidak bisa membaca angka asli.
//
// Maka nilai di bawah adalah PLACEHOLDER untuk pratinjau tampilan, BUKAN data
// produksi — jangan dipresentasikan sebagai data nyata. Blok statistik
// menampilkan catatan kecil di UI untuk menegaskan hal ini.
// Ganti `value` dengan angka nyata begitu sumber data publik tersedia, dan
// set `placeholder` ke false untuk menghilangkan catatan tersebut.

export type AboutStat = {
  /** Kunci unik untuk React list. */
  key: string;
  /** Label singkat di bawah angka. */
  label: string;
  /** Nilai akhir yang ditampilkan (dan target animasi count-up). */
  value: number;
  /** true = angka masih contoh/pratinjau, belum dari data produksi. */
  placeholder: boolean;
};

export const ABOUT_STATS: AboutStat[] = [
  { key: "users", label: "Pengguna terdaftar", value: 1200, placeholder: true },
  { key: "jobs", label: "Lowongan pekerjaan", value: 350, placeholder: true },
  { key: "recruiters", label: "Recruiter & perusahaan", value: 120, placeholder: true },
  { key: "applications", label: "Lamaran terkirim", value: 5000, placeholder: true },
];
