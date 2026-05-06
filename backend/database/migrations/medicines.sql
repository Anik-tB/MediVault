CREATE TABLE IF NOT EXISTS medicines (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rx BOOLEAN DEFAULT FALSE,
  certificate BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  category_icon VARCHAR(50),
  description TEXT,
  stock INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed Initial Data
INSERT INTO medicines (name, rx, certificate, category, category_icon, description, stock) VALUES
('Amoxicillin', true, false, 'Antibiotic', 'activity', 'Broad-spectrum antibiotic used to treat bacterial infections including respiratory tract infections, urinary tract infections, and skin infections. Must be taken exactly as prescribed.', 150),
('Ibuprofen', false, true, 'Painkiller', 'heart', 'Non-steroidal anti-inflammatory drug (NSAID) used to relieve pain, reduce inflammation, and bring down high temperatures. Recommended to take with food.', 20),
('Aspirin', false, true, 'Painkiller', 'heart', 'Used for pain relief, fever reduction, and as a blood thinner to prevent heart attacks and strokes.', 300),
('Warfarin', true, true, 'Anticoagulant', 'droplet', 'Blood thinner medication used to treat and prevent blood clots. Requires regular monitoring.', 30),
('Lisinopril', true, false, 'Blood Pressure', 'activity', 'ACE inhibitor used to treat high blood pressure, heart failure, and prevent kidney problems in diabetics.', 0),
('Metformin', true, true, 'Diabetes', 'plus-square', 'First-line medication for the treatment of type 2 diabetes. Helps control high blood sugar.', 500),
('Cetirizine', false, false, 'Antihistamine', 'wind', 'Antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, and sneezing.', 120),
('Omeprazole', false, true, 'Antacid', 'coffee', 'Proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach. Used to treat GERD.', 85)
ON CONFLICT DO NOTHING;
