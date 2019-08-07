ALTER TABLE bandbridge_posts
  DROP COLUMN IF EXISTS user_id;

DROP TABLE IF EXISTS bandbridge_users;