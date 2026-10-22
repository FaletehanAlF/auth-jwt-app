# Frontend JobTrack

Frontend JobTrack adalah aplikasi Next.js (App Router) untuk landing page, autentikasi, lowongan, lamaran, profil, dashboard recruiter, dan insight karier.

## Prasyarat

- Node.js + npm
- Backend JobTrack berjalan (default `http://localhost:5001`)

## Konfigurasi environment

Salin `frontend/.env.example` menjadi `frontend/.env.local` dan isi nilai yang sesuai:

- `NEXT_PUBLIC_API_URL` (default `http://localhost:5001/api`)
- `PORT` (default `5000`)

## Instalasi dan pengembangan

```bash
cd frontend
npm install
npm run dev
```

Development server berjalan di `http://localhost:5000` (sesuai script `dev`).

## Build dan menjalankan hasil build

```bash
cd frontend
npm run build
npm start
```

- `npm run build` membuat build produksi Next.js.
- `npm start` menjalankan hasil build pada port `5000`.

## Lint

```bash
cd frontend
npm run lint
```

Catatan: pada audit sebelumnya ditemukan beberapa error lint yang bersifat pre-existing (misalnya pada `AboutStats.tsx`, `NotificationBell.tsx`, `CurvedInput.jsx`, dan `LogoLoop.jsx`). Jangan memperbaiki di luar cakupan tanpa persetujuan.

## Hubungan dengan backend

Frontend memanggil API backend melalui `NEXT_PUBLIC_API_URL`. Backend menyediakan endpoint `/api/*` dan Socket.IO untuk notifikasi real-time. Origin frontend harus terdaftar pada `FRONTEND_URL` backend (CORS dan Socket.IO).