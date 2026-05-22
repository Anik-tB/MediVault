const db = require('../config/db');
const {
  AdminValidationError,
  handleAdminError,
  normalizeInteger,
  normalizeText,
} = require('../utils/admin.utils');
const env = require('../config/env');
const { verifyPrescriptionAgainstOrder } = require('../services/prescriptionVerification.service');

function resolveStorageUrl(raw) {
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${env.baseUrl}${raw}`;
}

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
    totalAmount: Number(row.total_amount || 0),
    medicines: row.medicines || 'No medicines',
    items: row.items || [],
    prescriptionId: row.prescription_id,
    prescriptionUrl: resolveStorageUrl(row.prescription_url),
    prescriptionStatus: row.prescription_status,
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
         COALESCE(o.total_amount, od.total_amount, 0.00) AS total_amount,
         COALESCE(u.full_name, p.patient_name, 'Unknown patient') AS patient_name,
         COALESCE(u.email, p.patient_email, '') AS patient_email,
         o.prescription_id,
         p.storage_url AS prescription_url,
         p.status AS prescription_status,
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
               'rx', m.rx,
               'unitPrice', COALESCE(oi.unit_price, oid.unit_price, 0.00)
             ) ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN users u ON u.firebase_uid = o.user_id
       LEFT JOIN prescriptions p ON p.id = o.prescription_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN medicines m ON m.id = oi.medicine_id
       LEFT JOIN order_details od ON od.order_id = o.id
       LEFT JOIN order_item_details oid ON oid.order_item_id = oi.id
       ${whereClause}
       GROUP BY o.id, o.status, o.created_at, o.pickup_time, o.rejection_reason, o.total_amount, od.total_amount, u.full_name, u.email, p.patient_name, p.patient_email, p.medicines_text, p.storage_url, p.status
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

exports.verifyOrderPrescription = async (req, res) => {
  try {
    const orderId = normalizeInteger(req.params.orderId, { fieldName: 'Order ID', min: 1 });

    const result = await db.query(
      `SELECT
         o.id,
         o.prescription_id,
         p.file_name,
         p.file_type,
         p.storage_url AS prescription_url,
         COALESCE(
           JSON_AGG(
             JSON_BUILD_OBJECT(
               'medicineId', oi.medicine_id,
               'name', oi.medicine_name,
               'quantity', oi.quantity,
               'rx', m.rx
             ) ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN prescriptions p ON p.id = o.prescription_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN medicines m ON m.id = oi.medicine_id
       WHERE o.id = $1
       GROUP BY o.id, p.id, p.file_name, p.file_type, p.storage_url`,
      [orderId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Order not found');
    }

    const order = result.rows[0];
    if (!order.prescription_id || !order.prescription_url) {
      throw new AdminValidationError('This order has no linked prescription to verify.');
    }

    const orderedMedicines = (Array.isArray(order.items) ? order.items : [])
      .filter((item) => item?.name)
      .map((item) => ({
        name: item.name,
        quantity: Number(item.quantity || 1),
        rx: Boolean(item.rx),
      }));

    const verification = await verifyPrescriptionAgainstOrder({
      orderedMedicines,
      prescription: {
        id: order.prescription_id,
        fileName: order.file_name,
        fileType: order.file_type,
        url: resolveStorageUrl(order.prescription_url),
      },
    });

    return res.status(200).json({
      orderId,
      displayId: `ORD-${String(orderId).padStart(4, '0')}`,
      prescriptionId: order.prescription_id,
      prescriptionTrackingId: `RX-${String(order.prescription_id).padStart(4, '0')}`,
      fileName: order.file_name,
      ...verification,
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while verifying prescription');
  }
};

exports.approveOrder = async (req, res) => {
  const client = await db.pool.connect();
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

    await client.query('BEGIN');

    const orderRes = await client.query(`SELECT user_id, status FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rowCount === 0) {
      throw new AdminValidationError('Order not found or cannot be approved');
    }
    const order = orderRes.rows[0];

    const result = await client.query(
      `UPDATE orders
       SET status = 'ready_for_pickup', pickup_time = $1, rejection_reason = NULL, updated_at = NOW()
       WHERE id = $2 AND status IN ('pending_pickup', 'rejected')
       RETURNING id`,
      [parsedPickupTime, orderId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Order cannot be approved from its current state');
    }

    // Deduct stock
    const items = await client.query(`SELECT medicine_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
    for (const item of items.rows) {
      if (item.medicine_id) {
        await client.query(`UPDATE medicines SET stock = GREATEST(stock - $1, 0) WHERE id = $2`, [item.quantity, item.medicine_id]);
      }
    }

    // Add Notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'order_update', 'Order Approved', $2)`,
      [order.user_id, `Your order ORD-${String(orderId).padStart(4, '0')} has been approved and is ready for pickup.`]
    );

    await client.query('COMMIT');

    return res.status(200).json({ message: `Order ORD-${String(orderId).padStart(4, '0')} approved` });
  } catch (error) {
    await client.query('ROLLBACK');
    return handleAdminError(res, error, 'Internal server error while approving order');
  } finally {
    client.release();
  }
};

exports.rejectOrder = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const orderId = normalizeInteger(req.params.orderId, { fieldName: 'Order ID', min: 1 });
    const reason = normalizeText(req.body?.reason, {
      fieldName: 'Rejection reason',
      maxLength: 500,
    });

    await client.query('BEGIN');

    const orderRes = await client.query(`SELECT user_id, status FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rowCount === 0) throw new AdminValidationError('Order not found');
    const order = orderRes.rows[0];

    const result = await client.query(
      `UPDATE orders
       SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
       WHERE id = $2 AND status IN ('pending_pickup', 'ready_for_pickup')
       RETURNING id`,
      [reason, orderId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Order not found or cannot be rejected');
    }

    // Restore stock if it was previously ready for pickup
    if (order.status === 'ready_for_pickup') {
      const items = await client.query(`SELECT medicine_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
      for (const item of items.rows) {
        if (item.medicine_id) {
          await client.query(`UPDATE medicines SET stock = stock + $1 WHERE id = $2`, [item.quantity, item.medicine_id]);
        }
      }
    }

    // Add Notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'order_update', 'Order Rejected', $2)`,
      [order.user_id, `Your order ORD-${String(orderId).padStart(4, '0')} was rejected. Reason: ${reason || 'Not specified'}.`]
    );

    await client.query('COMMIT');

    return res.status(200).json({ message: `Order ORD-${String(orderId).padStart(4, '0')} rejected` });
  } catch (error) {
    await client.query('ROLLBACK');
    return handleAdminError(res, error, 'Internal server error while rejecting order');
  } finally {
    client.release();
  }
};

exports.markPickedUp = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const orderId = normalizeInteger(req.params.orderId, { fieldName: 'Order ID', min: 1 });

    await client.query('BEGIN');

    const orderRes = await client.query(`SELECT user_id, status FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rowCount === 0) throw new AdminValidationError('Order not found');
    const order = orderRes.rows[0];

    const result = await client.query(
      `UPDATE orders
       SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND status = 'ready_for_pickup'
       RETURNING id`,
      [orderId]
    );

    if (result.rowCount === 0) {
      throw new AdminValidationError('Order not found or is not ready for pickup');
    }

    // Add Notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'order_update', 'Order Completed', $2)`,
      [order.user_id, `Your order ORD-${String(orderId).padStart(4, '0')} has been successfully picked up!`]
    );

    await client.query('COMMIT');

    return res.status(200).json({ message: `Order ORD-${String(orderId).padStart(4, '0')} marked as picked up` });
  } catch (error) {
    await client.query('ROLLBACK');
    return handleAdminError(res, error, 'Internal server error while completing order');
  } finally {
    client.release();
  }
};
