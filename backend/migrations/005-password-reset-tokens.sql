-- Migration 005: token reset kata sandi (satu kali pakai, kedaluwarsa singkat).
-- Dijalankan manual oleh pemilik database (REVIEW DULU, jangan auto-run).
-- Alasan: endpoint forgot-password menyimpan HASH token (bukan token mentah)
-- beserta waktu kedaluwarsa agar tautan reset hanya berlaku 15 menit
-- dan tidak bisa dipakai ulang. Migration lama tidak diubah.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_reset_token_hash (token_hash),
  KEY idx_reset_user_expires (user_id, expires_at),
  CONSTRAINT fk_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;
