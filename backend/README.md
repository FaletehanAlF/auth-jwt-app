# Backend JobTrack

Backend JobTrack adalah API Express + MySQL untuk autentikasi, lowongan, lamaran, notifikasi, insight, dan dashboard recruiter. Socket.IO dipakai untuk notifikasi real-time.

## Arsitektur singkat

- `index.ts` — entry point server: membuat HTTP server, menginisialisasi Socket.IO, lalu `listen` pada port `PORT` (default `5001`).
- `app.ts` — instance Express (CORS, JSON parser, penanganan body JSON tidak valid, health check `GET /`, mount `/api`, fallback 404). Dipisah dari `index.ts` agar bisa diuji tanpa membuka port.
- `routes.ts` — definisi seluruh route API (prefix `/api`).
- `config/database.ts` — pool MySQL (`mysql2/promise`) dari variabel `DB_*`.
- `config/config.ts` — `CV_DIR` (absolute path) dan `ALLOWED_ORIGINS`.
- `controllers/`, `middleware/`, `lib/`, `sockets/`, `validators/` — logika bisnis, otorisasi, upload CV, email reset password, Socket.IO.
- `migrations/` — file SQL yang diterapkan manual (tidak ada migration runner).

## Prasyarat

- Node.js + npm
- MySQL
- File `backend/.env` (salin dari `backend/.env.example`, isi nilai rahasia di `.env`, jangan commit)

## Konfigurasi environment

Variabel yang diperlukan (lihat `backend/.env.example`):

- `PORT` (default `5001`)
- `FRONTEND_URL` (daftar origin, dipisah koma)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `CV_DIR` (absolute path, default `C:\JobTrackPrivate\cv`)

Jangan menyalin nilai secret dari `.env` ke dokumentasi atau commit.

## Menjalankan backend (development)

```bash
cd backend
npm install
npm run dev
```

Server berjalan di `http://localhost:5001` (atau port pada `PORT`).

## Build dan menjalankan hasil build

```bash
cd backend
npm run build
npm start
```

- `npm run build` memakai `tsconfig.build.json` (mengeluarkan `dist/`, tanpa file test).
- `npm start` menjalankan `node dist/index.js`.

## Typecheck (tanpa build)

```bash
cd backend
npm run typecheck
```

Menjalankan `tsc --noEmit -p tsconfig.json` untuk memeriksa tipe seluruh source dan test tanpa membuat file.

## Test

Static contract test (tanpa database):

```bash
cd backend
npm test
```

Integration test (memerlukan database uji yang terisolasi):

```bash
cd backend
npm run test:integration
```

Prasyarat integration test:

- Set `DB_NAME` ke nama yang cocok pola guard: `jobtrack_test` atau `jobtrack_ci` (boleh dengan suffix, mis. `jobtrack_test_local`).
- Gunakan akun MySQL khusus pengujian dan database terpisah dari development/production.
- Jangan memakai database development atau production. Guard akan menolak nama yang tidak sesuai (fail closed).
- Database uji, akun, schema, dan fixture belum disediakan pada tahap ini; verifikasi terpisah diperlukan sebelum menjalankan skenario yang menyentuh database.

Cara menangani kegagalan test:

- Jika guard menolak `DB_NAME`, periksa nilai env dan pola nama database.
- Jika koneksi gagal, periksa kredensial dan host database uji.
- Jangan mengubah guard atau test untuk "meloloskan" kegagalan.

## Migrasi SQL

File migrasi berada di `backend/migrations/` (001–006). Tidak ada migration runner; penerapan dilakukan manual ke database yang sesuai. Urutan dan status penerapan perlu diverifikasi ke database aktual (belum dapat dipastikan dari repository).

## Catatan keamanan

- `.env` dan `.env.local` tidak boleh di-commit.
- Secret (JWT, DB password, Resend API key) tidak boleh ditampilkan di log atau dokumentasi.
- Guard database integration test bersifat fail-closed: nama database harus cocok pola `jobtrack_(test|ci)` dan diverifikasi via `SELECT DATABASE()`.