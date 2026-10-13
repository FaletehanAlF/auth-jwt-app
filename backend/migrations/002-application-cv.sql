-- ============================================================================
-- JobTrack FASE 2 — Migrasi metadata CV lamaran
-- File   : backend/migrations/002-application-cv.sql
-- Cara menjalankan (manual, via mysql client):
--   mysql -h <DB_HOST> -u <DB_USER> -p auth_db < backend/migrations/002-application-cv.sql
-- Jangan menjalankan migrasi otomatis. 001-application-status.sql sudah
-- diterapkan sebelumnya — jangan jalankan ulang atau ubah file tersebut.
-- File fisik CV tetap di CV_DIR (lihat backend/config.ts, default
-- C:\JobTrackPrivate\cv); migration ini hanya menambah metadata nullable.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tambah metadata CV ke tabel applications.
-- Semua kolom NULL sehingga lamaran lama (tanpa CV) tetap valid dan alur
-- Apply + status yang ada tidak berubah. Tidak menyentuh kolom status,
-- foreign key, atau unique key yang sudah ada. Tidak membuat ulang tabel.
-- ----------------------------------------------------------------------------
ALTER TABLE applications
  ADD COLUMN cv_path VARCHAR(512) NULL,
  ADD COLUMN cv_original_name VARCHAR(255) NULL,
  ADD COLUMN cv_mime VARCHAR(100) NULL,
  ADD COLUMN cv_size INT UNSIGNED NULL;
