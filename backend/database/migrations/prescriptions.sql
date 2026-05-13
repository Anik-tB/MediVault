CREATE TABLE IF NOT EXISTS prescriptions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         VARCHAR(128) NOT NULL,
  file_name       VARCHAR(255) NOT NULL,
  file_type       VARCHAR(120) NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 5242880),
  storage_url     TEXT,
  status          VARCHAR(40) NOT NULL DEFAULT 'submitted',
  review_notes    TEXT,
  reviewed_at     TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  patient_name    VARCHAR(150),           -- For guest orders or manual entry
  patient_email   VARCHAR(255),
  medicines_text  TEXT,                   -- Comma-separated medicine names from prescription
  CONSTRAINT prescriptions_status_check
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected'))
);

-- Safe ALTER for existing databases
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_name   VARCHAR(150);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_email  VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medicines_text TEXT;
