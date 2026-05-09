-- Admin web support for the MediVault pharmacist portal.
-- Migration Order:
--   1. users.sql
--   2. medicines.sql
--   3. cart.sql
--   4. prescriptions.sql
--   5. orders.sql
--   6. user_profile_settings.sql  <-- must run BEFORE this file (adds dept column to users)
--   7. notifications.sql
--   8. admin_web.sql              <-- this file

ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS expiry_date DATE;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pickup_time TIMESTAMP,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS patient_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS patient_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS medicines_text TEXT;

CREATE TABLE IF NOT EXISTS staff_users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  phone VARCHAR(30),
  department VARCHAR(120) NOT NULL DEFAULT 'Pharmacy & Dispensary',
  role VARCHAR(50) NOT NULL DEFAULT 'System Administrator',
  password_hash VARCHAR(256) NOT NULL,
  password_salt VARCHAR(128) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  order_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  low_stock_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  expiry_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_reports BOOLEAN NOT NULL DEFAULT FALSE,
  theme VARCHAR(20) NOT NULL DEFAULT 'light',
  sidebar_density VARCHAR(20) NOT NULL DEFAULT 'default',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT staff_users_theme_check CHECK (theme IN ('light', 'dark', 'system')),
  CONSTRAINT staff_users_sidebar_density_check CHECK (sidebar_density IN ('compact', 'default', 'relaxed'))
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  id BIGSERIAL PRIMARY KEY,
  staff_id BIGINT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drug_interactions (
  id BIGSERIAL PRIMARY KEY,
  medicine_a_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  medicine_b_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  severity VARCHAR(20) NOT NULL,
  clinical_description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT drug_interactions_severity_check CHECK (severity IN ('mild', 'moderate', 'severe')),
  CONSTRAINT drug_interactions_pair_check CHECK (medicine_a_id <> medicine_b_id),
  CONSTRAINT drug_interactions_unique_pair UNIQUE (medicine_a_id, medicine_b_id)
);

-- Set expiry dates for seeded medicines (all future-dated for demo)
UPDATE medicines SET expiry_date = CASE name
  WHEN 'Amoxicillin' THEN DATE '2027-01-15'
  WHEN 'Ibuprofen'   THEN DATE '2026-11-20'
  WHEN 'Aspirin'     THEN DATE '2026-12-10'
  WHEN 'Warfarin'    THEN DATE '2026-12-01'
  WHEN 'Lisinopril'  THEN DATE '2026-11-11'
  WHEN 'Metformin'   THEN DATE '2027-06-30'
  WHEN 'Cetirizine'  THEN DATE '2027-03-15'
  WHEN 'Omeprazole'  THEN DATE '2026-09-22'
  ELSE COALESCE(expiry_date, CURRENT_DATE + INTERVAL '1 year')::DATE
END
WHERE expiry_date IS NULL;

-- Seed default admin account (logs in via Google: freegeminipro0004@gmail.com)
-- password_hash is a non-usable placeholder since this account uses Google Sign-In
INSERT INTO staff_users (
  full_name,
  email,
  employee_id,
  phone,
  department,
  role,
  password_hash,
  password_salt
) VALUES (
  'Admin User',
  'freegeminipro0004@gmail.com',
  'EMP-0001',
  '',
  'Pharmacy & Dispensary',
  'System Administrator',
  'google-auth-only-no-password-login-placeholder-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'google-auth-only-salt'
)
ON CONFLICT (email) DO NOTHING;

-- Seed demo patient users for admin dashboard visibility
-- NOTE: user_profile_settings.sql must run first to add the 'department' column to users
INSERT INTO users (firebase_uid, email, full_name, phone, role, department) VALUES
  ('demo-user-john',  'john.smith@unihealth.edu', 'John Smith',  '+1 555 0101', 'user', 'Student Health'),
  ('demo-user-sarah', 'sarah.lee@unihealth.edu',  'Sarah Lee',   '+1 555 0102', 'user', 'Student Health'),
  ('demo-user-mike',  'm.torres@unihealth.edu',   'Mike Torres', '+1 555 0103', 'user', 'Student Health'),
  ('demo-user-emma',  'emma.d@unihealth.edu',     'Emma Davis',  '+1 555 0104', 'user', 'Student Health')
ON CONFLICT (firebase_uid) DO NOTHING;

-- Seed demo orders with deterministic IDs (sequence is updated after)
WITH inserted_orders AS (
  INSERT INTO orders (id, user_id, status, created_at, pickup_time)
  VALUES
    (41, 'demo-user-john',  'pending_pickup',   TIMESTAMP '2026-03-10 09:00:00', NULL),
    (38, 'demo-user-sarah', 'ready_for_pickup', TIMESTAMP '2026-03-09 08:45:00', TIMESTAMP '2026-03-09 14:30:00'),
    (35, 'demo-user-mike',  'completed',         TIMESTAMP '2026-03-08 08:25:00', TIMESTAMP '2026-03-08 10:00:00'),
    (31, 'demo-user-emma',  'completed',         TIMESTAMP '2026-03-07 08:10:00', TIMESTAMP '2026-03-07 09:15:00')
  ON CONFLICT (id) DO NOTHING
  RETURNING id
)
SELECT setval(pg_get_serial_sequence('orders', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM orders), 1), true);

-- Seed order items (idempotent)
INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity)
SELECT 41, id, name, 1 FROM medicines
WHERE name = 'Amoxicillin' AND NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 41 AND medicine_name = 'Amoxicillin');

INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity)
SELECT 38, id, name, 1 FROM medicines
WHERE name = 'Warfarin' AND NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 38 AND medicine_name = 'Warfarin');

INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity)
SELECT 35, id, name, 1 FROM medicines
WHERE name = 'Aspirin' AND NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 35 AND medicine_name = 'Aspirin');

INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity)
SELECT 35, id, name, 1 FROM medicines
WHERE name = 'Cetirizine' AND NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 35 AND medicine_name = 'Cetirizine');

INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity)
SELECT 31, id, name, 1 FROM medicines
WHERE name = 'Metformin' AND NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 31 AND medicine_name = 'Metformin');

-- Seed demo prescriptions (idempotent)
INSERT INTO prescriptions (id, user_id, file_name, file_type, file_size_bytes, storage_url, status, review_notes, reviewed_at, created_at, patient_name, patient_email, medicines_text) VALUES
  (12, 'demo-user-john',  'rx_john_smith.pdf',  'application/pdf', 240000, '/uploads/demo-rx-john.pdf',  'submitted', NULL,                                               NULL,                           TIMESTAMP '2026-03-10 10:35:00', 'John Smith',  'john.smith@unihealth.edu', 'Amoxicillin'),
  (11, 'demo-user-sarah', 'rx_sarah_lee.jpg',   'image/jpeg',      410000, '/uploads/demo-rx-sarah.jpg', 'approved',  'Prescription approved',                            TIMESTAMP '2026-03-09 11:15:00', TIMESTAMP '2026-03-09 09:40:00', 'Sarah Lee',   'sarah.lee@unihealth.edu',  'Warfarin'),
  (10, 'demo-user-mike',  'rx_mike_torres.png', 'image/png',       360000, '/uploads/demo-rx-mike.png',  'rejected',  'Prescription is illegible; signature not visible.', TIMESTAMP '2026-03-08 12:00:00', TIMESTAMP '2026-03-08 08:55:00', 'Mike Torres', 'm.torres@unihealth.edu',   'Lisinopril'),
  (9,  'demo-user-emma',  'rx_emma_davis.pdf',  'application/pdf', 210000, '/uploads/demo-rx-emma.pdf',  'submitted', NULL,                                               NULL,                           TIMESTAMP '2026-03-07 08:35:00', 'Emma Davis',  'emma.d@unihealth.edu',     'Amoxicillin, Ibuprofen')
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('prescriptions', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM prescriptions), 1), true);

-- Seed drug interaction rules (The Twist core data)
-- Aspirin + Warfarin: SEVERE
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id,
  'severe',
  'Concomitant use significantly increases bleeding risk and may lead to life-threatening hemorrhage. Aspirin inhibits platelet aggregation while Warfarin inhibits clotting factors; together they create a compounding anticoagulant effect.'
FROM medicines a, medicines b
WHERE a.name = 'Aspirin' AND b.name = 'Warfarin'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Ibuprofen + Aspirin: MODERATE
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id,
  'moderate',
  'NSAIDs like Ibuprofen may reduce the cardioprotective effect of low-dose Aspirin and increase gastrointestinal bleeding risk when taken concurrently.'
FROM medicines a, medicines b
WHERE a.name = 'Ibuprofen' AND b.name = 'Aspirin'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Metformin + Ibuprofen: MILD
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id,
  'mild',
  'NSAIDs may reduce the renal clearance of Metformin, potentially increasing plasma levels and the risk of lactic acidosis in patients with renal impairment.'
FROM medicines a, medicines b
WHERE a.name = 'Metformin' AND b.name = 'Ibuprofen'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;
