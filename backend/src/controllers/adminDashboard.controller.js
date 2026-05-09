const db = require('../config/db');
const { handleAdminError } = require('../utils/admin.utils');

function mapOrderStatus(status) {
  const labels = {
    pending_pickup: 'Pending',
    ready_for_pickup: 'Ready for Pickup',
    completed: 'Completed',
    rejected: 'Rejected',
  };

  return labels[status] || status;
}

exports.getAdminDashboard = async (_req, res) => {
  try {
    const [statsResult, stockAlertsResult, recentOrdersResult, weeklyResult] = await Promise.all([
      db.query(
        `SELECT
           (SELECT COUNT(*) FROM medicines) AS total_medicines,
           (SELECT COUNT(*) FROM medicines WHERE stock > 0 AND stock <= 50) AS low_stock_alerts,
           (SELECT COUNT(*) FROM medicines WHERE expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '6 months') AS expiring_soon,
           (SELECT COUNT(*) FROM orders WHERE status = 'pending_pickup') AS pending_orders,
           (SELECT COUNT(*) FROM prescriptions WHERE status IN ('submitted', 'under_review')) AS pending_prescriptions,
           (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS weekly_orders,
           (SELECT COUNT(*) FROM prescriptions WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS weekly_prescriptions`
      ),
      db.query(
        `SELECT id, name, category, stock, expiry_date
         FROM medicines
         WHERE stock <= 50 OR (expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '6 months')
         ORDER BY stock ASC, expiry_date ASC
         LIMIT 6`
      ),
      db.query(
        `SELECT
           o.id,
           o.status,
           o.created_at,
           o.pickup_time,
           COALESCE(u.full_name, p.patient_name, 'Unknown patient') AS patient_name,
           COALESCE(u.email, p.patient_email, '') AS patient_email,
           COALESCE(STRING_AGG(oi.medicine_name, ', ' ORDER BY oi.id), p.medicines_text, 'No medicines') AS medicines,
           COUNT(oi.id) AS items_count
         FROM orders o
         LEFT JOIN users u ON u.firebase_uid = o.user_id
         LEFT JOIN prescriptions p ON p.id = o.prescription_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         GROUP BY o.id, o.status, o.created_at, o.pickup_time, u.full_name, u.email, p.patient_name, p.patient_email, p.medicines_text
         ORDER BY o.created_at DESC
         LIMIT 6`
      ),
      db.query(
        `WITH days AS (
           SELECT generate_series(0, 6) AS day_offset
         )
         SELECT
           TO_CHAR(DATE_TRUNC('week', CURRENT_DATE) + (day_offset || ' day')::INTERVAL, 'Dy') AS day,
           COALESCE((SELECT COUNT(*) FROM orders WHERE DATE(created_at) = DATE(DATE_TRUNC('week', CURRENT_DATE) + (day_offset || ' day')::INTERVAL)), 0) AS orders,
           COALESCE((SELECT COUNT(*) FROM prescriptions WHERE DATE(created_at) = DATE(DATE_TRUNC('week', CURRENT_DATE) + (day_offset || ' day')::INTERVAL)), 0) AS prescriptions
         FROM days
         ORDER BY day_offset`
      ),
    ]);

    const stats = statsResult.rows[0] || {};

    return res.status(200).json({
      summary: {
        totalMedicines: Number(stats.total_medicines || 0),
        weeklyActivity: Number(stats.weekly_orders || 0) + Number(stats.weekly_prescriptions || 0),
        weeklyOrders: Number(stats.weekly_orders || 0),
        weeklyPrescriptions: Number(stats.weekly_prescriptions || 0),
        lowStockAlerts: Number(stats.low_stock_alerts || 0),
        expiringSoon: Number(stats.expiring_soon || 0),
        pendingOrders: Number(stats.pending_orders || 0),
        pendingPrescriptions: Number(stats.pending_prescriptions || 0),
      },
      stockAlerts: stockAlertsResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        stock: Number(row.stock),
        expiryDate: row.expiry_date,
      })),
      recentOrders: recentOrdersResult.rows.map((row) => ({
        id: row.id,
        displayId: `ORD-${String(row.id).padStart(4, '0')}`,
        patientName: row.patient_name,
        patientEmail: row.patient_email,
        medicines: row.medicines,
        status: row.status,
        statusLabel: mapOrderStatus(row.status),
        createdAt: row.created_at,
        pickupTime: row.pickup_time,
        itemsCount: Number(row.items_count || 0),
      })),
      weeklyActivity: weeklyResult.rows.map((row) => ({
        day: row.day,
        orders: Number(row.orders || 0),
        prescriptions: Number(row.prescriptions || 0),
      })),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while fetching admin dashboard');
  }
};
