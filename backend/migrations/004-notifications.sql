-- ============================================================================
-- JobTrack FASE 4 — Migrasi tabel notifikasi
-- File   : backend/migrations/004-notifications.sql
-- Cara menjalankan (MANUAL, setelah ditinjau; jangan otomatis):
--   mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < backend/migrations/004-notifications.sql
-- atau dengan environment variables yang sudah dimuat tanpa menampilkan rahasia:
--   mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < backend/migrations/004-notifications.sql
--
-- Migration ini READ-ONLY audit sebelumnya menunjukkan:
--   users.id   -> int AUTO_INCREMENT
--   jobs.id    -> int AUTO_INCREMENT
--   applications.id -> int AUTO_INCREMENT
-- ============================================================================

-- LANGKAH 0 (READ-ONLY, OPSIONAL):
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications';

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id INT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_notifications_user_created (user_id, created_at),
  KEY idx_notifications_user_unread (user_id, is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- Verifikasi hanya (read-only, opsional):
-- DESCRIBE notifications;
-- SHOW CREATE TABLE notifications;
