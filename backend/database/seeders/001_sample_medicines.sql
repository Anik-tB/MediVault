INSERT INTO medicines (
  name,
  generic_name,
  category,
  dosage_form,
  strength,
  active_ingredient,
  description,
  requires_prescription
)
VALUES
  ('Aspirin', 'Aspirin', 'Pain Relief', 'Tablet', '75 mg', 'Acetylsalicylic Acid', 'Used for mild pain and anti-platelet support.', FALSE),
  ('Warfarin', 'Warfarin', 'Blood Thinner', 'Tablet', '5 mg', 'Warfarin Sodium', 'Anticoagulant that needs interaction monitoring.', TRUE),
  ('Amoxicillin', 'Amoxicillin', 'Antibiotic', 'Capsule', '500 mg', 'Amoxicillin', 'Broad-spectrum antibiotic for bacterial infections.', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO medicine_conflicts (medicine_id, conflicts_with_medicine_id, reason)
SELECT aspirin.id, warfarin.id, 'Aspirin may increase bleeding risk when combined with Warfarin.'
FROM medicines aspirin
CROSS JOIN medicines warfarin
WHERE aspirin.name = 'Aspirin'
  AND warfarin.name = 'Warfarin'
ON CONFLICT DO NOTHING;
