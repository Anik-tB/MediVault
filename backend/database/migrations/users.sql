CREATE TABLE IF NOT EXISTS users (
  id           BIGSERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE,           -- Maps DB profile to Firebase Auth user
  email        VARCHAR(255) UNIQUE NOT NULL,
  full_name    VARCHAR(150),
  phone        VARCHAR(30),
  role         VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Added via user_profile_settings.sql (kept here for reference)
ALTER TABLE users ADD COLUMN IF NOT EXISTS department   VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group  VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP NOT NULL DEFAULT NOW();
