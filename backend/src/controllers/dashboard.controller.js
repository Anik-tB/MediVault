const db = require('../config/db');
const { ensureUserRecord } = require('../utils/account.utils');

function mapRecentOrder(row) {
  return {
    id: row.id,
    displayId: `ORD-${String(row.id).padStart(4, '0')}`,
    status: row.status,
    createdAt: row.created_at,
    itemsCount: Number(row.items_count),
    totalUnits: Number(row.total_units),
    itemsLabel: row.items_label || 'No medicines',
  };
}

exports.getDashboard = async (req, res) => {
  try {
    await ensureUserRecord(req.user);

    const [summaryResult, recentOrdersResult] = await Promise.all([
      db.query(
        `SELECT
           COALESCE((
             SELECT COUNT(*)
             FROM orders
             WHERE user_id = $1
               AND status IN ('pending_pickup', 'ready_for_pickup')
           ), 0) AS active_orders,
           COALESCE((
             SELECT SUM(quantity)
             FROM cart_items
             WHERE user_id = $1
           ), 0) AS cart_items,
           COALESCE((
             SELECT COUNT(*)
             FROM prescriptions
             WHERE user_id = $1
               AND status IN ('submitted', 'under_review')
           ), 0) AS pending_prescriptions,
           COALESCE((
             SELECT COUNT(*)
             FROM medicines
             WHERE stock > 0
           ), 0) AS medicines_available`,
        [req.user.firebase_uid]
      ),
      db.query(
        `SELECT
           o.id,
           o.status,
           o.created_at,
           COUNT(oi.id) AS items_count,
           COALESCE(SUM(oi.quantity), 0) AS total_units,
           COALESCE(
             STRING_AGG(
               CASE
                 WHEN oi.quantity > 1 THEN oi.medicine_name || ' x' || oi.quantity
                 ELSE oi.medicine_name
               END,
               ', '
               ORDER BY oi.id
             ),
             'No medicines'
           ) AS items_label
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT 4`,
        [req.user.firebase_uid]
      ),
    ]);

    const summaryRow = summaryResult.rows[0];

    return res.status(200).json({
      summary: {
        activeOrders: Number(summaryRow.active_orders),
        cartItems: Number(summaryRow.cart_items),
        pendingPrescriptions: Number(summaryRow.pending_prescriptions),
        medicinesAvailable: Number(summaryRow.medicines_available),
      },
      recentOrders: recentOrdersResult.rows.map(mapRecentOrder),
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return res.status(500).json({
      error: 'Internal server error while fetching dashboard',
    });
  }
};
