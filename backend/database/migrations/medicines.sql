CREATE TABLE IF NOT EXISTS medicines (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  rx            BOOLEAN DEFAULT FALSE,
  certificate   BOOLEAN DEFAULT FALSE,
  category      VARCHAR(100),
  category_icon VARCHAR(50),
  description   TEXT,
  stock         INT DEFAULT 0,
  expiry_date   DATE,                          -- Stored as DATE (matches live DB)
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Side table: stores pricing and clinical dose intervals
CREATE TABLE IF NOT EXISTS medicine_details (
  medicine_id        BIGINT PRIMARY KEY REFERENCES medicines(id) ON DELETE CASCADE,
  price              NUMERIC(10, 2) DEFAULT 0.00,
  dose_interval_days INT DEFAULT 0
);

-- ============================================================
-- SEED DATA — All 23 medicines (matches live database exactly)
-- ============================================================
INSERT INTO medicines (name, rx, certificate, category, category_icon, description, stock, expiry_date) VALUES
('Amoxicillin',              true,  false, 'Antibiotic',    'activity',    'Broad-spectrum antibiotic for bacterial infections including respiratory, urinary tract, and skin infections.',                                              150, '2027-01-15'),
('Ibuprofen',                false, true,  'Painkiller',    'heart',       'NSAID used to relieve pain, reduce inflammation, and bring down high temperatures. Take with food.',                                                          20,  '2026-11-20'),
('Aspirin',                  false, true,  'Painkiller',    'heart',       'Used for pain relief, fever reduction, and as a blood thinner to prevent heart attacks and strokes.',                                                         300, '2026-12-10'),
('Warfarin',                 true,  true,  'Anticoagulant', 'droplet',     'Blood thinner used to treat and prevent blood clots. Requires regular INR monitoring.',                                                                       30,  '2026-12-01'),
('Lisinopril',               true,  false, 'Blood Pressure','activity',    'ACE inhibitor for high blood pressure, heart failure, and kidney protection in diabetics.',                                                                   0,   '2026-11-11'),
('Metformin',                true,  true,  'Diabetes',      'plus-square', 'First-line medication for type 2 diabetes. Lowers blood glucose by reducing liver glucose production.',                                                       500, '2027-06-30'),
('Cetirizine',               false, false, 'Antihistamine', 'wind',        'Antihistamine for allergy symptoms: watery eyes, runny nose, itching, and sneezing.',                                                                         120, '2027-03-15'),
('Omeprazole',               false, true,  'Antacid',       'coffee',      'Proton pump inhibitor that reduces stomach acid. Treats GERD and peptic ulcers.',                                                                            85,  '2026-09-22'),
('Azithromycin 500mg',       true,  false, 'Antibiotic',    'activity',    'Macrolide antibiotic for pneumonia, ear infections, and sexually transmitted diseases.',                                                                      120, '2027-05-12'),
('Cefuroxime 500mg',         true,  false, 'Antibiotic',    'activity',    'Second-generation cephalosporin for respiratory, urinary tract, and skin infections.',                                                                        85,  '2027-05-12'),
('Amlodipine 5mg',           true,  false, 'Blood Pressure','activity',    'Calcium channel blocker for high blood pressure and chest pain (angina).',                                                                                    250, '2027-05-12'),
('Atorvastatin 10mg',        true,  false, 'Cholesterol',   'activity',    'Statin for lowering bad cholesterol (LDL) and raising good cholesterol (HDL).',                                                                              180, '2027-05-12'),
('Esomeprazole 20mg',        false, false, 'Antacid',       'coffee',      'Proton pump inhibitor for GERD, ulcers, and acid-related stomach conditions.',                                                                               300, '2027-05-12'),
('Pantoprazole 40mg',        false, false, 'Antacid',       'coffee',      'Reduces excess stomach acid. Treats GERD and Zollinger-Ellison syndrome.',                                                                                   240, '2027-05-12'),
('Montelukast 10mg',         true,  false, 'Respiratory',   'wind',        'Leukotriene inhibitor to prevent asthma symptoms and treat seasonal allergic rhinitis.',                                                                      150, '2027-05-12'),
('Salbutamol Inhaler',       true,  false, 'Respiratory',   'wind',        'Bronchodilator inhaler for quick relief of asthma and COPD symptoms.',                                                                                        45,  '2027-05-12'),
('Vitamin C (Ceevit)',       false, false, 'Supplements',   'plus-square', 'Essential vitamin for immune support, collagen synthesis, and antioxidant protection.',                                                                       500, '2027-05-12'),
('B-Complex (B-50 Forte)',   false, false, 'Supplements',   'plus-square', 'B-vitamin complex for energy metabolism, nervous system health, and red blood cell production.',                                                             400, '2027-05-12'),
('Paracetamol 500mg (Napa)', false, false, 'Painkiller',    'heart',       'Most widely used painkiller in Bangladesh for mild-to-moderate pain and fever.',                                                                             1000,'2027-05-12'),
('Diclofenac Gel',           false, false, 'Painkiller',    'heart',       'Topical NSAID for local pain relief. Apply to affected muscles and joints.',                                                                                  60,  '2027-05-12'),
('Metformin 500mg',          true,  true,  'Diabetes',      'plus-square', 'Tablet for type 2 diabetes. Lowers blood glucose by decreasing liver glucose production.',                                                                   350, '2027-05-12'),
('Sitagliptin 50mg',         true,  false, 'Diabetes',      'plus-square', 'DPP-4 inhibitor for type 2 diabetes. Increases insulin release after meals.',                                                                                90,  '2027-05-12'),
('Fexofenadine 120mg',       false, false, 'Antihistamine', 'wind',        'Non-drowsy antihistamine for seasonal allergic rhinitis and chronic urticaria (hives).',                                                                     210, '2027-05-12')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DETAILS — Exact prices and dose intervals (live DB)
-- ============================================================
INSERT INTO medicine_details (medicine_id, price, dose_interval_days)
SELECT id,
  CASE name
    WHEN 'Amoxicillin'              THEN 26.50
    WHEN 'Ibuprofen'                THEN 7.00
    WHEN 'Aspirin'                  THEN 8.00
    WHEN 'Warfarin'                 THEN 19.00
    WHEN 'Lisinopril'               THEN 40.00
    WHEN 'Metformin'                THEN 51.00
    WHEN 'Cetirizine'               THEN 22.00
    WHEN 'Omeprazole'               THEN 5.50
    WHEN 'Azithromycin 500mg'       THEN 35.00
    WHEN 'Cefuroxime 500mg'         THEN 45.00
    WHEN 'Amlodipine 5mg'           THEN 5.50
    WHEN 'Atorvastatin 10mg'        THEN 12.00
    WHEN 'Esomeprazole 20mg'        THEN 7.00
    WHEN 'Pantoprazole 40mg'        THEN 8.50
    WHEN 'Montelukast 10mg'         THEN 16.00
    WHEN 'Salbutamol Inhaler'       THEN 250.00
    WHEN 'Vitamin C (Ceevit)'       THEN 2.50
    WHEN 'B-Complex (B-50 Forte)'   THEN 3.50
    WHEN 'Paracetamol 500mg (Napa)' THEN 1.20
    WHEN 'Diclofenac Gel'           THEN 85.00
    WHEN 'Metformin 500mg'          THEN 4.00
    WHEN 'Sitagliptin 50mg'         THEN 22.00
    WHEN 'Fexofenadine 120mg'       THEN 10.00
    ELSE 10.00
  END,
  CASE name
    WHEN 'Amoxicillin'        THEN 7   -- Full antibiotic course
    WHEN 'Azithromycin 500mg' THEN 3   -- 3-day course
    WHEN 'Cefuroxime 500mg'   THEN 7   -- 7-day course
    WHEN 'Montelukast 10mg'   THEN 7   -- Weekly respiratory check
    WHEN 'Lisinopril'         THEN 30  -- Monthly BP prescription
    WHEN 'Amlodipine 5mg'     THEN 30  -- Monthly BP prescription
    WHEN 'Atorvastatin 10mg'  THEN 30  -- Monthly cholesterol
    WHEN 'Metformin'          THEN 30  -- Monthly diabetes
    WHEN 'Metformin 500mg'    THEN 30  -- Monthly diabetes
    WHEN 'Sitagliptin 50mg'   THEN 30  -- Monthly diabetes
    ELSE 0                             -- OTC: no restriction
  END
FROM medicines
ON CONFLICT (medicine_id) DO NOTHING;
