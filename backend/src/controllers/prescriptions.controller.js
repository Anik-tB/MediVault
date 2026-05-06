const db = require('../config/db');
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
    await ensureUserRecord(req.user);

    const requestBody = req.body || {};
    const fileName = normalizeOptionalText(requestBody.fileName, {
      fieldName: 'fileName',
      maxLength: 255,
    });
    const fileType = normalizeOptionalText(requestBody.fileType, {
      fieldName: 'fileType',
      maxLength: 120,
    });

    if (!fileName || !fileType) {
      throw new ValidationError('fileName and fileType are required');
    }

    const storageUrl = hasOwnProperty(requestBody, 'storageUrl')
      ? normalizeOptionalText(requestBody.storageUrl, {
          fieldName: 'storageUrl',
          maxLength: 1000,
        })
      : null;

    const fileSizeBytes = Number(requestBody.fileSizeBytes);

    if (!Number.isFinite(fileSizeBytes) || fileSizeBytes < 1 || fileSizeBytes > 5242880) {
      throw new ValidationError('fileSizeBytes must be between 1 and 5242880');
    }

    const result = await db.query(
      `INSERT INTO prescriptions (
         user_id,
         file_name,
         file_type,
         file_size_bytes,
         storage_url,
         status
       )
       VALUES ($1, $2, $3, $4, $5, 'submitted')
       RETURNING
         id,
         file_name,
         file_type,
         file_size_bytes,
         storage_url,
         status,
         review_notes,
         reviewed_at,
         created_at,
         updated_at`,
      [req.user.firebase_uid, fileName, fileType, fileSizeBytes, storageUrl]
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
