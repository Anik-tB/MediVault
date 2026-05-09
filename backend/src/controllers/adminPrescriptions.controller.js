const db = require('../config/db');
const {
  AdminValidationError,
  handleAdminError,
  normalizeInteger,
  normalizeText,
} = require('../utils/admin.utils');

function mapStatus(status) {
  if (status === 'submitted' || status === 'under_review') return 'pending';
  return status;
}

function mapPrescription(row) {
  const status = mapStatus(row.status);
  return {
    id: row.id,
    trackingId: `RX-${String(row.id).padStart(4, '0')}`,
    patientName: row.patient_name || row.user_full_name || 'Unknown patient',
    patientEmail: row.patient_email || row.user_email || '',
    fileName: row.file_name,
    fileType: row.file_type,
    fileSizeBytes: Number(row.file_size_bytes || 0),
    storageUrl: row.storage_url || '',
    documentKind: row.file_type?.includes('pdf') ? 'PDF Document' : row.file_type?.includes('jpeg') || row.file_type?.includes('jpg') ? 'JPG Document' : row.file_type?.includes('png') ? 'PNG Document' : 'Document',
    medicines: row.medicines_text || row.linked_medicines || 'Not specified',
    status,
    rawStatus: row.status,
    reviewNotes: row.review_notes || '',
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

exports.getAdminPrescriptions = async (req, res) => {
  try {
    const search = normalizeText(req.query?.search, { fieldName: 'Search', maxLength: 120 });
    const status = normalizeText(req.query?.status, { fieldName: 'Status', maxLength: 30 });
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      if (status === 'pending') {
        conditions.push(`p.status IN ('submitted', 'under_review')`);
      } else {
        params.push(status);
        conditions.push(`p.status = $${params.length}`);
      }
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(CAST(p.id AS TEXT) ILIKE $${params.length} OR p.patient_name ILIKE $${params.length} OR p.patient_email ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR p.file_name ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT
         p.*,
         u.full_name AS user_full_name,
         u.email AS user_email,
         COALESCE(STRING_AGG(oi.medicine_name, ', ' ORDER BY oi.id), '') AS linked_medicines
       FROM prescriptions p
       LEFT JOIN users u ON u.firebase_uid = p.user_id
       LEFT JOIN orders o ON o.prescription_id = p.id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${whereClause}
       GROUP BY p.id, u.full_name, u.email
       ORDER BY p.created_at DESC`,
      params
    );

    const prescriptions = result.rows.map(mapPrescription);

    return res.status(200).json({
      prescriptions,
      stats: {
        total: prescriptions.length,
        pending: prescriptions.filter((item) => item.status === 'pending').length,
        approved: prescriptions.filter((item) => item.status === 'approved').length,
        rejected: prescriptions.filter((item) => item.status === 'rejected').length,
      },
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while fetching prescriptions');
  }
};

async function reviewPrescription(prescriptionId, status, notes) {
  const result = await db.query(
    `UPDATE prescriptions
     SET status = $1,
         review_notes = $2,
         reviewed_at = NOW(),
         updated_at = NOW()
     WHERE id = $3
     RETURNING id`,
    [status, notes, prescriptionId]
  );

  if (result.rowCount === 0) {
    throw new AdminValidationError('Prescription not found');
  }
}

exports.approvePrescription = async (req, res) => {
  try {
    const prescriptionId = normalizeInteger(req.params.prescriptionId, {
      fieldName: 'Prescription ID',
      min: 1,
    });
    const notes = normalizeText(req.body?.notes, {
      fieldName: 'Review notes',
      maxLength: 500,
    }) || 'Prescription approved';

    await reviewPrescription(prescriptionId, 'approved', notes);

    return res.status(200).json({ message: `Prescription RX-${String(prescriptionId).padStart(4, '0')} approved` });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while approving prescription');
  }
};

exports.rejectPrescription = async (req, res) => {
  try {
    const prescriptionId = normalizeInteger(req.params.prescriptionId, {
      fieldName: 'Prescription ID',
      min: 1,
    });
    const notes = normalizeText(req.body?.notes, {
      fieldName: 'Rejection notes',
      maxLength: 500,
      required: true,
    });

    await reviewPrescription(prescriptionId, 'rejected', notes);

    return res.status(200).json({ message: `Prescription RX-${String(prescriptionId).padStart(4, '0')} rejected` });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while rejecting prescription');
  }
};
