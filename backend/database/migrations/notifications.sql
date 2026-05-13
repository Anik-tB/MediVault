CREATE TABLE IF NOT EXISTS notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    VARCHAR(128) NOT NULL,
  type       VARCHAR(40) NOT NULL,
  title      VARCHAR(120) NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES users(firebase_uid)
    ON DELETE CASCADE
);
