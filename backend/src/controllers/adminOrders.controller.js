const db = require('../config/db');
const {
  AdminValidationError,
  handleAdminError,
  normalizeInteger,
  normalizeText,
} = require('../utils/admin.utils');

function statusLabel(status) {
  const labels = {
    pending_pickup: 'Pending',
    ready_for_pickup: 'Ready for Pickup',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return labels[status] || status;
}

function mapOrder(row) {
  return {
    id: row.id,
    displayId: `ORD-${String(row.id).padStart(4, '0')}`,
    patientName: row.patient_name || 'Unknown patient',
    patientEmail: row.patient_email || '',
    status: row.status,
    statusLabel: statusLabel(row.status),
    createdAt: row.created_at,
    pickupTime: row.pickup_time,
    rejectionReason: row.rejection_reason || '',
    itemsCount: Number(row.items_count || 0),
    totalUnits: Number(row.total_units || 0),
    medicines: row.medicines || 'No medicines',
    items: row.items || [],
  };
}

exports.getAdminOrders = async (req, res) => {
  try {
    const search = normalizeText(req.query?.search, { fieldName: 'Search', maxLength: 120 });
    const status = normalizeText(req.query?.status, { fieldName: 'Status', maxLength: 40 });
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(CAST(o.id AS TEXT) ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR p.patient_name ILIKE $${params.length} OR p.patient_email ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT
         o.id,
         o.status,
         o.created_at,
         o.pickup_time,
         o.rejection_reason,
         COALESCE(u.full_name, p.patient_name, 'Unknown patient') AS patient_name,
         COALESCE(u.email, p.patient_email, '') AS patient_email,
         COUNT(oi.id) AS items_count,
         COALESCE(SUM(oi.quantity), 0) AS total_units,
         COALESCE(STRING_AGG(oi.medicine_name, ', ' ORDER BY oi.id), p.medicines_text, 'No medicines') AS medicines,
         COALESCE(
           JSON_AGG(
             JSON_BUILD_OBJECT(
               'id', oi.id,
               'medicineId', oi.medicine_id,
               'name', oi.medicine_name,
               'quantity', oi.quantity,
               'category', m.category,
               'rx', m.rx
             ) ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN users u ON u.firebase_uid = o.user_id
       LEFT JOIN prescriptions p ON p.id = o.prescription_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN medicines m ON m.id = oi.medicine_id
       ${whereClause}
       GROUP BY o.id, o.status, o.created_at, o.pickup_time, o.rejection_reason, u.full_name, u.email, p.patient_name, p.patient_email, p.medicines_text
       ORDER BY o.created_at DESC`,
      params
    );

    const orders = result.rows.map(mapOrder);

    return res.status(200).json({
      orders,
      stats: {
        total: orders.length,
        pending: orders.filter((order) => order.status === 'pending_pickup').length,
        ready: orders.filter((order) => order.status === 'ready_for_pickup').length,
        completed: orders.filter((order) => order.status === 'completed').length,
        rejected: orders.filter((order) => order.status === 'rejected').length,
      },
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while fetching orders');
  }
};

exports.approveOrder = async (req, res) => {
  try {
    const orderId = normalizeInteger(req.params.orderId, { fieldName: 'Order ID', min: 1 });
    const pickupTime = normalizeText(req.body?.pickupTime, {
      fieldName: 'Pickup time',
      maxLength: 40,
      required: true,
    });

    const parsedPickupTime = new Date(pickupTime);
    if (Number.isNaN(parsedPickupTime.getTime())) {
      throw new AdminValidationError('Pickup time must be a valid date/time');
    }

    const result = await db.query(
      `UPDATE orders
       SET status = 'ready_for_pickup', pickup_time = $1, rejection_reason = NULL, updated_at = NOW()
       WHERE id = $2 AND status IN ('pending_pickup', 'rejected')
       RETURNING id`,
      [parsedPickupTime, orderId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Order not found or cannot be approved');
    }

    return res.status(200).json({ message: `Order ORD-${String(orderId).padStart(4, '0')} approved` });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while approving order');
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const orderId = normalizeInteger(req.params.orderId, { fieldName: 'Order ID', min: 1 });
    const reason = normalizeText(req.body?.reason, {
      fieldName: 'Rejection reason',
      maxLength: 500,
    });

    const result = await db.query(
      `UPDATE orders
       SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
       WHERE id = $2 AND status IN ('pending_pickup', 'ready_for_pickup')
       RETURNING id`,
      [reason, orderId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Order not found or cannot be rejected');
    }

    return res.status(200).json({ message: `Order ORD-${String(orderId).padStart(4, '0')} rejected` });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while rejecting order');
  }
};

exports.markPickedUp = async (req, res) => {
  try {
    const orderId = normalizeInteger(req.params.orderId, { fieldName: 'Order ID', min: 1 });

    const result = await db.query(
      `UPDATE orders
       SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND status = 'ready_for_pickup'
       RETURNING id`,
      [orderId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Order not found or is not ready for pickup');
    }

    return res.status(200).json({ message: `Order ORD-${String(orderId).padStart(4, '0')} marked as picked up` });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while completing order');
  }
};
