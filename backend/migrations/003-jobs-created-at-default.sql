-- ============================================================================
-- JobTrack FASE 3 — Migrasi default created_at lowongan
-- File   : backend/migrations/003-jobs-created-at-default.sql
-- Cara menjalankan (manual, via mysql client):
--   mysql -h <DB_HOST> -u <DB_USER> -p auth_db < backend/migrations/003-jobs-created-at-default.sql
-- Jangan menjalankan migrasi otomatis. Jalankan LANGKAH 0 terlebih dahulu
-- dan baca hasilnya sebelum lanjut ke LANGKAH 1.
-- Migrasi ini idempotent: boleh dijalankan ulang tanpa efek ganda.
-- ============================================================================
--
-- MASALAH
-- Kolom jobs.created_at terdefinisi sebagai `timestamp NULL DEFAULT NULL`,
-- sedangkan backend/controllers/jobController.ts (createJob) tidak menyertakan
-- created_at pada INSERT:
--   INSERT INTO jobs (title, description, location, company, recruiter_id) ...
-- Akibatnya SETIAP lowongan baru tersimpan dengan created_at = NULL, sehingga
-- frontend/src/app/recruiter/jobs/page.tsx menampilkan teks fallback
-- "Tanggal pembuatan tidak tersedia".
--
-- BUKAN salah baca di frontend: frontend sudah membaca job.created_at dengan
-- benar, dan GET /recruiter/jobs sudah menyertakan kolom created_at. Yang salah
-- adalah nilai NULL di database.
--
-- TUJUAN
-- 1. Mengisi created_at yang masih NULL memakai waktu saat migrasi dijalankan.
-- 2. Mengubah definisi kolom menjadi NOT NULL DEFAULT CURRENT_TIMESTAMP
--    supaya lowongan baru otomatis terisi tanpa perubahan kode createJob.
--
-- TIDAK ADA PERBAIKAN KODE YANG DISYARANKAN
-- Backend dan frontend dibiarkan apa adanya. Setelah LANGKAH 2, INSERT milik
-- createJob tetap valid karena DEFAULT CURRENT_TIMESTAMP memenuhi kolom yang
-- tidak diberikan. createJob tidak perlu dan tidak boleh diubah.
--
-- CATATAN PENTING SOAL BACKFILL
-- Waktu asli(lowongan lama) TIDAK dapat dipulihkan. Nilai sebelumnya NULL,
-- jadi tidak ada satu pun sumber di kolom ini yang menyimpan kapan lowongan itu
-- dibuat. Nilai yang diisi LANGKAH 1 adalah waktu eksekusi migrasi, bukan waktu
-- pembuatan sebenarnya, dan tidak boleh dibaca sebagai data historis yang
-- akurat.

-- ----------------------------------------------------------------------------
-- LANGKAH 0 (READ-ONLY): lihat berapa baris yang masih NULL sebelum diisi.
-- Hasil audit (2026-10-13, read-only): 4 dari 4 baris lowongan bernilai NULL.
-- Catat jumlahnya sebagai pembanding setelah LANGKAH 3.
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS total_lowongan,
       SUM(created_at IS NULL) AS masih_null
FROM jobs;

-- Urutan WAJIB: LANGKAH 1 (isi NULL) harus mendahului LANGKAH 2 (pasang
-- NOT NULL). Jika dibalik, ALTER TABLE akan gagal dengan error 1138
-- "Invalid use of NULL value" pada baris lama.

-- ----------------------------------------------------------------------------
-- LANGKAH 1: backfill baris yang masih NULL.
-- Mengubah kolom yang nilainya tidak ada menjadi ada, jadi ini satu-satunya
-- langkah yang menulis data historis. WHERE created_at IS NULL membuat langkah
-- ini aman: baris yang sudah punya tanggal asli tidak pernah tersentuh.
-- ----------------------------------------------------------------------------
UPDATE jobs SET created_at = NOW() WHERE created_at IS NULL;

-- ----------------------------------------------------------------------------
-- LANGKAH 2: pasang DEFAULT CURRENT_TIMESTAMP + NOT NULL.
-- MODIFY COLUMN bersifat idempotent — menjalankan ulang menghasilkan definisi
-- yang sama. DEFAULT ditulis eksplisit agar perilakunya tidak bergantung pada
-- setting explicit_defaults_for_timestamp dan agar kolom TIDAK ikut mendapat
-- ON UPDATE CURRENT_TIMESTAMP otomatis pada beberapa versi MySQL.
-- Tipe tetap TIMESTAMP (bukan DATETIME) agar konsisten dengan tabel
-- applications dan tidak mengubah semantik data yang sudah ada.
-- Hanya kolom ini yang disentuh; id, title, description, location, company,
-- recruiter_id, primary key, dan foreign key tidak berubah.
-- Foreign key jobs_ibfk_1 (recruiter_id -> users.id) tidak terpengaruh karena
-- kolom yang dimodifikasi tidak dipakai dalam FK.
-- ----------------------------------------------------------------------------
ALTER TABLE jobs
  MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ----------------------------------------------------------------------------
-- LANGKAH 3 (READ-ONLY): verifikasi hasil.
-- Nilai yang diharapkan: masih_null = 0 dan created_at_ada = total_lowongan.
-- Nilai created_at pada baris lama adalah waktu migrasi, bukan waktu(lowongan
-- itu benar-benar dibuat.
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS total_lowongan,
       SUM(created_at IS NULL) AS masih_null,
       SUM(created_at IS NOT NULL) AS created_at_ada
FROM jobs;

SHOW CREATE TABLE jobs;