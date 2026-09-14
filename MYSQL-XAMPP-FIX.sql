-- PGTSC Quiz Arena v20 - MySQL/XAMPP setup
-- Your XAMPP root account has no password.
CREATE DATABASE IF NOT EXISTS quiz_arena CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- IMPORTANT: If an old ai_jobs table already exists and Drizzle reports
-- "Invalid default value for finished_at", run this after selecting quiz_arena.
USE quiz_arena;

-- Safe for the existing ai_jobs table only; if the table does not exist yet,
-- skip this statement and run `npx drizzle-kit push` first.
-- ALTER TABLE ai_jobs MODIFY finished_at TIMESTAMP NULL DEFAULT NULL;
