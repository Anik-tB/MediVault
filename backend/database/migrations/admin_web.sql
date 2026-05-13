-- ============================================================
-- admin_web.sql — MediVault Pharmacist Admin Portal
-- ============================================================
-- Migration Order (run in this sequence):
--   1. users.sql
--   2. medicines.sql
--   3. cart_items.sql
--   4. cart_items_view.sql
--   5. prescriptions.sql
--   6. orders.sql
--   7. user_profile_settings.sql
--   8. notifications.sql
--   9. admin_web.sql   <-- this file
-- ============================================================

-- ============================================================
-- TABLES: Staff authentication and drug interaction tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_users (
  id               BIGSERIAL PRIMARY KEY,
  full_name        VARCHAR(150) NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  employee_id      VARCHAR(50) UNIQUE,
  phone            VARCHAR(30),
  department       VARCHAR(120) NOT NULL DEFAULT 'Pharmacy & Dispensary',
  role             VARCHAR(50)  NOT NULL DEFAULT 'System Administrator',
  password_hash    VARCHAR(256) NOT NULL,
  password_salt    VARCHAR(128) NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  order_alerts     BOOLEAN NOT NULL DEFAULT TRUE,
  low_stock_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  expiry_alerts    BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_reports   BOOLEAN NOT NULL DEFAULT FALSE,
  theme            VARCHAR(20)  NOT NULL DEFAULT 'light',
  sidebar_density  VARCHAR(20)  NOT NULL DEFAULT 'default',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT staff_users_theme_check
    CHECK (theme IN ('light', 'dark', 'system')),
  CONSTRAINT staff_users_sidebar_density_check
    CHECK (sidebar_density IN ('compact', 'default', 'relaxed'))
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  id         BIGSERIAL PRIMARY KEY,
  staff_id   BIGINT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drug_interactions (
  id                   BIGSERIAL PRIMARY KEY,
  medicine_a_id        BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  medicine_b_id        BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  severity             VARCHAR(20) NOT NULL,
  clinical_description TEXT NOT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT drug_interactions_severity_check
    CHECK (severity IN ('mild', 'moderate', 'severe')),
  CONSTRAINT drug_interactions_pair_check
    CHECK (medicine_a_id <> medicine_b_id),
  CONSTRAINT drug_interactions_unique_pair
    UNIQUE (medicine_a_id, medicine_b_id)
);

-- ============================================================
-- SEED: Admin account (Google Sign-In only — no password login)
-- Replace email below with your actual Google account email
-- ============================================================
INSERT INTO staff_users (
  full_name, email, employee_id, phone, department, role, password_hash, password_salt
) VALUES (
  'Admin User',
  'hulahuhu015@gmail.com',
  'EMP-0001',
  '',
  'Pharmacy & Dispensary',
  'System Administrator',
  'google-auth-only-no-password-login-placeholder-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'google-auth-only-salt'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED: Clinical drug interaction rules (real medical data)
-- These are permanent safety rules, NOT demo data
-- ============================================================

-- Aspirin + Warfarin: SEVERE bleeding risk
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id, 'severe',
  'Concomitant use significantly increases bleeding risk. Aspirin inhibits platelet aggregation while Warfarin inhibits clotting factors — together they create compounding anticoagulation and risk of life-threatening hemorrhage.'
FROM medicines a, medicines b WHERE a.name = 'Aspirin' AND b.name = 'Warfarin'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Ibuprofen + Aspirin: MODERATE GI bleed and reduced cardio protection
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id, 'moderate',
  'NSAIDs like Ibuprofen may reduce the cardioprotective effect of low-dose Aspirin and increase gastrointestinal bleeding risk when taken concurrently.'
FROM medicines a, medicines b WHERE a.name = 'Ibuprofen' AND b.name = 'Aspirin'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Metformin + Ibuprofen: MILD lactic acidosis risk
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id, 'mild',
  'NSAIDs may reduce the renal clearance of Metformin, potentially increasing plasma levels and the risk of lactic acidosis in patients with renal impairment.'
FROM medicines a, medicines b WHERE a.name = 'Metformin' AND b.name = 'Ibuprofen'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Amlodipine + Lisinopril: MODERATE hypotension
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id, 'moderate',
  'Amlodipine combined with Lisinopril can cause excessive blood pressure lowering (hypotension), dizziness, and fainting. Monitor blood pressure closely when combining these two antihypertensives.'
FROM medicines a, medicines b WHERE a.name = 'Amlodipine 5mg' AND b.name = 'Lisinopril'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Azithromycin + Warfarin: MILD QT prolongation
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id, 'mild',
  'Azithromycin can prolong the QT interval. Combining with Warfarin increases risk of serious cardiac arrhythmias (Torsades de Pointes). INR monitoring is recommended.'
FROM medicines a, medicines b WHERE a.name = 'Azithromycin 500mg' AND b.name = 'Warfarin'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Metformin 500mg + Ibuprofen: MILD lactic acidosis risk (same as Metformin)
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id, 'mild',
  'NSAIDs may reduce the renal clearance of Metformin, potentially increasing plasma levels and the risk of lactic acidosis in patients with renal impairment.'
FROM medicines a, medicines b WHERE a.name = 'Metformin 500mg' AND b.name = 'Ibuprofen'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;

-- Warfarin + Aspirin: SEVERE (reverse direction)
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
SELECT a.id, b.id, 'severe',
  'Combined use of Warfarin and Aspirin greatly increases the risk of major bleeding including intracranial hemorrhage. Avoid unless benefits clearly outweigh risks with close clinical monitoring.'
FROM medicines a, medicines b WHERE a.name = 'Warfarin' AND b.name = 'Aspirin'
ON CONFLICT (medicine_a_id, medicine_b_id) DO NOTHING;
