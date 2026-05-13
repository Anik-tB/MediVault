const db = require('../config/db');
const env = require('../config/env');
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

function resolveStorageUrl(raw) {
  if (!raw) return '';
  // Already an absolute URL — return as-is
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  // Legacy relative path — prefix with backend base URL
  return `${env.baseUrl}${raw}`;
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
    storageUrl: resolveStorageUrl(row.storage_url),
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
      const searchPattern = `%${search}%`;
      let idSearchPattern = searchPattern;
      
      // If search looks like RX-0029, extract 29
      if (search.toUpperCase().startsWith('RX-')) {
        const numericPart = search.substring(3).replace(/^0+/, '');
        if (numericPart) idSearchPattern = `%${numericPart}%`;
      }

      params.push(searchPattern);
      const sIdx = params.length;
      params.push(idSearchPattern);
      const idIdx = params.length;

      conditions.push(`(
        CAST(p.id AS TEXT) ILIKE $${idIdx} OR 
        p.patient_name ILIKE $${sIdx} OR 
        p.patient_email ILIKE $${sIdx} OR 
        u.full_name ILIKE $${sIdx} OR 
        u.email ILIKE $${sIdx} OR 
        p.file_name ILIKE $${sIdx}
      )`);
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
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE prescriptions
       SET status = $1,
           review_notes = $2,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, user_id`,
      [status, notes, prescriptionId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Prescription not found');
    }

    const { user_id } = result.rows[0];
    const rxId = `RX-${String(prescriptionId).padStart(4, '0')}`;
    
    // Add Notification for the user
    const title = status === 'approved' ? 'Prescription Approved' : 'Prescription Rejected';
    const message = status === 'approved' 
      ? `Your prescription ${rxId} has been approved. You can now proceed with your medicine pickup.`
      : `Your prescription ${rxId} was rejected. Reason: ${notes}`;

    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'prescription_update', $2, $3)`,
      [user_id, title, message]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
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
