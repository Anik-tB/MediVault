const db = require('../config/db');

exports.parsePrescription = async (req, res) => {
  try {
    const fileName = req.file ? req.file.originalname.toLowerCase() : (req.body.fileName || '').toLowerCase();
    
    // Seed list of doctors
    const doctors = [
      'Dr. Sabrina Rahman, MD (Cardiology)',
      'Dr. Asif Iqbal, MBBS, FCPS (Medicine)',
      'Dr. Nusrat Jahan, MD (Pediatrics)',
      'Dr. Tanjim Hasan, MBBS (General Physician)'
    ];
    const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
    
    let detectedMeds = [];
    
    // Fetch all medicines from the DB to return valid ones
    const medsRes = await db.query('SELECT name, rx FROM medicines');
    const dbMeds = medsRes.rows;
    
    // Check if filename matches any db medicines
    for (const med of dbMeds) {
      const nameParts = med.name.toLowerCase().split(' ');
      const match = nameParts.some(part => part.length > 3 && fileName.includes(part));
      if (match || fileName.includes(med.name.toLowerCase())) {
        detectedMeds.push({
          name: med.name,
          rx: med.rx,
          confidence: 0.92,
          dosage: med.rx ? '1 tablet twice daily' : 'Take as needed for symptoms',
          duration: med.rx ? '7 days' : '5 days'
        });
      }
    }
    
    // Fallback defaults if no match in filename
    if (detectedMeds.length === 0) {
      const rxMeds = dbMeds.filter(m => m.rx);
      const otcMeds = dbMeds.filter(m => !m.rx);
      
      const randomRx = rxMeds[Math.floor(Math.random() * rxMeds.length)];
      const randomOtc = otcMeds[Math.floor(Math.random() * otcMeds.length)];
      
      if (randomRx) {
        detectedMeds.push({
          name: randomRx.name,
          rx: true,
          confidence: 0.88,
          dosage: '1 tablet daily after meal',
          duration: '30 days'
        });
      }
      if (randomOtc) {
        detectedMeds.push({
          name: randomOtc.name,
          rx: false,
          confidence: 0.95,
          dosage: '1 tablet twice daily as needed',
          duration: '7 days'
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      doctorName: randomDoctor,
      patientName: req.user ? req.user.name || 'Jane Doe' : 'Jane Doe',
      prescriptionDate: new Date().toISOString().split('T')[0],
      medicines: detectedMeds,
      confidence: 0.91
    });
  } catch (error) {
    console.error('Error parsing prescription OCR:', error);
    return res.status(500).json({ error: 'Internal server error during simulated OCR parsing' });
  }
};
