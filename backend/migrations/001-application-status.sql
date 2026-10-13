-- ============================================================================
-- JobTrack FASE 1 — Migrasi status lamaran
-- File   : backend/migrations/001-application-status.sql
-- Cara menjalankan (manual, via mysql client):
--   mysql -h <DB_HOST> -u <DB_USER> -p auth_db < backend/migrations/001-application-status.sql
-- Jangan menjalankan migrasi otomatis. Jalankan LANGKAH 0 terlebih dahulu
-- dan baca hasilnya sebelum lanjut ke LANGKAH 2.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- LANGKAH 0 (WAJIB, READ-ONLY): audit duplikat sebelum unique constraint.
-- Jika query ini mengembalikan baris, HENTIKAN migrasi di sini — JANGAN
-- menghapus/menggabungkan lamaran otomatis. Tangani duplikat secara
-- manual/terpisah, lalu jalankan ulang audit sampai hasilnya kosong.
-- Hasil audit terakhir (2026-10-13, read-only): 0 baris duplikat.
-- ----------------------------------------------------------------------------
SELECT job_id, jobseeker_id, COUNT(*) AS jumlah
FROM applications
GROUP BY job_id, jobseeker_id
HAVING COUNT(*) > 1;

-- ----------------------------------------------------------------------------
-- LANGKAH 1: tambah kolom status.
-- Tipe ENUM konsisten dengan gaya kolom users.role yang sudah ada.
-- NOT NULL + DEFAULT 'pending' sehingga seluruh lamaran lama otomatis
-- terisi 'pending' saat kolom dibuat (tidak ada data yang NULL).
-- ----------------------------------------------------------------------------
ALTER TABLE applications
  ADD COLUMN status ENUM('pending','reviewed','interview','accepted','rejected')
  NOT NULL DEFAULT 'pending';

-- Pengaman eksplisit (idempotent): pastikan tidak ada baris non-pending
-- yang lolos — pada MySQL langkah ini adalah no-op setelah DEFAULT di atas.
UPDATE applications SET status = 'pending' WHERE status IS NULL;

-- ----------------------------------------------------------------------------
-- LANGKAH 2: cegah lamaran ganda di level database.
-- Hanya jalankan SETELAH LANGKAH 0 memastikan tidak ada duplikat.
-- Melengkapi pengecekan duplikat di applicationController.applyJob
-- (pertahanan berlapis terhadap race condition dua request bersamaan).
-- ----------------------------------------------------------------------------
ALTER TABLE applications
  ADD UNIQUE KEY uniq_job_jobseeker (job_id, jobseeker_id);
