-- Optional manual SQL for MySQL if you do not use `npx drizzle-kit push`.
CREATE TABLE IF NOT EXISTS gallery_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT NULL,
  event_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  quiz_id INT NULL,
  teacher_id INT NULL,
  class_name TEXT NULL,
  participant_count INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX gallery_events_date_idx (event_date),
  INDEX gallery_events_published_idx (published)
);
CREATE TABLE IF NOT EXISTS gallery_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  original_path TEXT NULL,
  optimized_path TEXT NOT NULL,
  thumb_path TEXT NOT NULL,
  alt_text TEXT NULL,
  width INT NOT NULL DEFAULT 0,
  height INT NOT NULL DEFAULT 0,
  bytes INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX gallery_photos_event_idx (event_id)
);
CREATE TABLE IF NOT EXISTS public_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  quiz_id INT NULL,
  event_id INT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX public_reviews_status_idx (status),
  INDEX public_reviews_created_idx (created_at)
);
