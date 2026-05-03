CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE, -- Maps the DB profile to the Firebase Auth user
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150),
  phone VARCHAR(30),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
