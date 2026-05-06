CREATE TABLE IF NOT EXISTS prescriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(120) NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 5242880),
  storage_url TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'submitted',
  review_notes TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT prescriptions_status_check
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected'))
);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS prescription_id BIGINT REFERENCES prescriptions(id) ON DELETE SET NULL;
