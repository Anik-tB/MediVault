const db = require('../config/db');
const env = require('../config/env');
const supabase = require('../config/supabase');
const {
  ValidationError,
  ensureUserRecord,
  hasOwnProperty,
  normalizeOptionalText,
} = require('../utils/account.utils');

function mapPrescriptionRow(row) {
  return {
    id: row.id,
    trackingId: `RX-${String(row.id).padStart(4, '0')}`,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSizeBytes: Number(row.file_size_bytes),
    storageUrl: row.storage_url || '',
    status: row.status,
    reviewNotes: row.review_notes || '',
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    usableForOrders: row.status !== 'rejected',
    patientName: row.patient_name || '',
    patientEmail: row.patient_email || '',
    medicinesText: row.medicines_text || '',
  };
}

exports.getPrescriptions = async (req, res) => {
  try {
    await ensureUserRecord(req.user);

    const prescriptionsResult = await db.query(
      `SELECT
         id,
         file_name,
         file_type,
         file_size_bytes,
         storage_url,
         status,
         review_notes,
         reviewed_at,
         created_at,
         updated_at
       FROM prescriptions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.firebase_uid]
    );

    const prescriptions = prescriptionsResult.rows.map(mapPrescriptionRow);
    const stats = {
      total: prescriptions.length,
      pending: prescriptions.filter(
        (prescription) =>
          prescription.status === 'submitted' || prescription.status === 'under_review'
      ).length,
      approved: prescriptions.filter((prescription) => prescription.status === 'approved').length,
      rejected: prescriptions.filter((prescription) => prescription.status === 'rejected').length,
    };

    return res.status(200).json({
      prescriptions,
      stats,
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return res.status(500).json({
      error: 'Internal server error while fetching prescriptions',
    });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const userRecord = await ensureUserRecord(req.user);

    if (!req.file) {
      throw new ValidationError('A prescription file is required.');
    }

    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSizeBytes = req.file.size;

    if (!fileName || !fileType) {
      throw new ValidationError('fileName and fileType are required');
    }

    if (!Number.isFinite(fileSizeBytes) || fileSizeBytes < 1 || fileSizeBytes > 5242880) {
      throw new ValidationError('fileSizeBytes must be between 1 and 5242880');
    }

    if (!supabase) {
      throw new Error('Supabase storage is not configured properly.');
    }

    // Upload to Supabase Storage
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${req.user.firebase_uid}-${Date.now()}.${fileExtension}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(uniqueFileName, req.file.buffer, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to upload file to storage');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(uniqueFileName);

    const storageUrl = publicUrl;

    const patientName = req.body.patientName || userRecord.full_name || req.user.email.split('@')[0];
    const patientEmail = req.body.patientEmail || req.user.email;
    const medicinesText = req.body.medicinesText || '';

    const result = await db.query(
      `INSERT INTO prescriptions (
         user_id,
         file_name,
         file_type,
         file_size_bytes,
         storage_url,
         status,
         patient_name,
         patient_email,
         medicines_text
       )
       VALUES ($1, $2, $3, $4, $5, 'submitted', $6, $7, $8)
       RETURNING *`,
      [req.user.firebase_uid, fileName, fileType, fileSizeBytes, storageUrl, patientName, patientEmail, medicinesText]
    );

    return res.status(201).json({
      message: 'Prescription submitted successfully',
      prescription: mapPrescriptionRow(result.rows[0]),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error creating prescription:', error);
    return res.status(500).json({
      error: 'Internal server error while submitting prescription',
    });
  }
};
