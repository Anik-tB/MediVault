CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL, -- References firebase_uid
  medicine_id BIGINT REFERENCES medicines(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, medicine_id)
);
