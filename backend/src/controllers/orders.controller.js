const db = require('../config/db');

// GET /api/v1/orders/:orderId — Fetch medicines for a specific order
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user_id = req.user.firebase_uid;

    // Verify the order belongs to this user, then fetch its items
    const result = await db.query(
      `SELECT oi.id, oi.medicine_name, oi.quantity, oi.medicine_id, COALESCE(oid.unit_price, 0.00) as unit_price
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN order_item_details oid ON oid.order_item_id = oi.id
       WHERE oi.order_id = $1 AND o.user_id = $2`,
      [orderId, user_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Internal server error while fetching order details' });
  }
};

// DELETE /api/v1/orders/:orderId — Cancel a pending order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user_id = req.user.firebase_uid;

    // Only allow deletion if the order belongs to this user AND is still pending
    const result = await db.query(
      `DELETE FROM orders
       WHERE id = $1 AND user_id = $2 AND status = 'pending_pickup'
       RETURNING id`,
      [orderId, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        error: 'Cannot cancel this order. It may already be prepared or does not belong to you.',
      });
    }

    res.status(200).json({ message: 'Order cancelled successfully', order_id: orderId });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Internal server error while cancelling order' });
  }
};

// GET /api/v1/orders — Fetch user's order history with stats
exports.getOrders = async (req, res) => {
  try {
    const user_id = req.user.firebase_uid;

    // Fetch all orders with medicine count per order
    const ordersResult = await db.query(
      `SELECT 
        o.id,
        o.status,
        o.created_at,
        COUNT(oi.id) AS items_count,
        COALESCE(od.total_amount, 0.00) AS total_amount
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN order_details od ON od.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id, od.total_amount
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    // Compute stats
    const orders = ordersResult.rows;
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending_pickup').length,
      ready: orders.filter(o => o.status === 'ready_for_pickup').length,
      completed: orders.filter(o => o.status === 'completed').length,
    };

    res.status(200).json({ orders, stats });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error while fetching orders' });
  }
};

// POST /api/v1/orders — Reserve for Pickup
exports.reserveForPickup = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const user_id = req.user.firebase_uid;

    await client.query('BEGIN');

    // 1. Fetch the user's current cart items (joined with medicine name)
    const cartResult = await client.query(
      `SELECT c.id as cart_item_id, c.medicine_id, c.quantity, m.name as medicine_name, m.rx as rx_required, COALESCE(md.price, 0.00) as price
       FROM cart_items c
       JOIN medicines m ON c.medicine_id = m.id
       LEFT JOIN medicine_details md ON md.medicine_id = m.id
       WHERE c.user_id = $1`,
      [user_id]
    );

    if (cartResult.rows.length === 0) {
      // Allow empty cart if recent prescription exists
      const prescriptionResult = await client.query(
        `SELECT id, status
         FROM prescriptions
         WHERE user_id = $1
           AND status IN ('submitted', 'under_review', 'approved')
         ORDER BY created_at DESC
         LIMIT 1`,
        [user_id]
      );

      if (prescriptionResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Your cart is empty and no recent prescription found.' });
      }

      const linkedPrescriptionId = prescriptionResult.rows[0].id;

      // Create the order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, status, prescription_id)
         VALUES ($1, 'pending_pickup', $2)
         RETURNING *`,
        [user_id, linkedPrescriptionId]
      );
      const order = orderResult.rows[0];

      await client.query('COMMIT');

      return res.status(201).json({
        message: 'Prescription-only pickup reserved successfully!',
        order_id: order.id,
        status: order.status,
        item_count: 0,
      });
    }



    // Interaction Safety Check
    const conflictQuery = `
      SELECT di.severity, di.clinical_description, ma.name as medicine_a_name, mb.name as medicine_b_name
      FROM drug_interactions di
      JOIN medicines ma ON ma.id = di.medicine_a_id
      JOIN medicines mb ON mb.id = di.medicine_b_id
      WHERE 
        (
          -- Check if both are in cart
          (di.medicine_a_id IN (SELECT medicine_id FROM cart_items WHERE user_id = $1) AND
           di.medicine_b_id IN (SELECT medicine_id FROM cart_items WHERE user_id = $1))
          OR
          -- Check if one is in cart and the other is in recent history
          (di.medicine_a_id IN (SELECT medicine_id FROM cart_items WHERE user_id = $1) AND
           di.medicine_b_id IN (
             SELECT oi.medicine_id FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.user_id = $1 AND o.status != 'rejected' AND o.created_at >= NOW() - INTERVAL '7 days'
           ))
          OR
          (di.medicine_b_id IN (SELECT medicine_id FROM cart_items WHERE user_id = $1) AND
           di.medicine_a_id IN (
             SELECT oi.medicine_id FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.user_id = $1 AND o.status != 'rejected' AND o.created_at >= NOW() - INTERVAL '7 days'
           ))
        )
      LIMIT 1
    `;
    const conflictResult = await client.query(conflictQuery, [user_id]);
    
    if (conflictResult.rows.length > 0) {
      await client.query('ROLLBACK');
      const conflict = conflictResult.rows[0];
      return res.status(409).json({
        error: 'Interaction Warning',
        severity: conflict.severity,
        message: `Interaction Warning: Cannot complete reservation due to a ${conflict.severity} interaction between ${conflict.medicine_a_name} and ${conflict.medicine_b_name}. ${conflict.clinical_description}`,
        clinicalDescription: conflict.clinical_description
      });
    }

    let linkedPrescriptionId = null;

    // Check if any item requires a prescription
    const rxItems = cartResult.rows.filter(item => item.rx_required);
    if (rxItems.length > 0) {
      const prescriptionResult = await client.query(
        `SELECT id, status
         FROM prescriptions
         WHERE user_id = $1
           AND status IN ('submitted', 'under_review', 'approved')
         ORDER BY created_at DESC
         LIMIT 1`,
        [user_id]
      );

      if (prescriptionResult.rowCount === 0) {
        await client.query('ROLLBACK');
        const rxNames = rxItems.map(i => i.medicine_name).join(', ');
        return res.status(403).json({
          error: 'Prescription required',
          message: `The following medicines require a valid prescription before pickup: ${rxNames}. Please upload your prescription in the Prescriptions section.`,
          rx_items: rxNames,
        });
      }

      linkedPrescriptionId = prescriptionResult.rows[0].id;
    }

    // 2. Calculate Total Amount (Subtotal + 5% VAT)
    let subtotal = 0;
    for (const item of cartResult.rows) {
      subtotal += parseFloat(item.price) * item.quantity;
    }
    const totalAmount = parseFloat((subtotal * 1.05).toFixed(2));

    // 3. Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, prescription_id, total_amount)
       VALUES ($1, 'pending_pickup', $2, $3)
       RETURNING *`,
      [user_id, linkedPrescriptionId, totalAmount]
    );
    const order = orderResult.rows[0];

    // Save Total Amount to side table for backward compatibility if needed
    await client.query(`INSERT INTO order_details (order_id, total_amount) VALUES ($1, $2)`, [order.id, totalAmount]);

    // 4. Insert each cart item into order_items
    for (const item of cartResult.rows) {
      const oiResult = await client.query(
        `INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [order.id, item.medicine_id, item.medicine_name, item.quantity, item.price]
      );
      await client.query(`INSERT INTO order_item_details (order_item_id, unit_price) VALUES ($1, $2)`, [oiResult.rows[0].id, item.price]);
    }

    // 4. Update prescription medicines_text so admin can see what was ordered
    if (linkedPrescriptionId) {
      const allNames = cartResult.rows.map(i => i.medicine_name).join(', ');
      await client.query(
        `UPDATE prescriptions SET medicines_text = $1 WHERE id = $2 AND (medicines_text IS NULL OR medicines_text = '')`,
        [allNames, linkedPrescriptionId]
      );
    }

    // 5. Clear the user's cart
    await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [user_id]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Pickup reserved successfully!',
      order_id: order.id,
      status: order.status,
      item_count: cartResult.rows.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reserving pickup:', error);
    res.status(500).json({ error: 'Internal server error while reserving pickup' });
  } finally {
    client.release();
  }
};
