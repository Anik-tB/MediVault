const db = require('../config/db');

// POST /api/v1/orders — Reserve for Pickup
exports.reserveForPickup = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const user_id = req.user.firebase_uid;

    await client.query('BEGIN');

    // 1. Fetch the user's current cart items (joined with medicine name)
    const cartResult = await client.query(
      `SELECT c.id as cart_item_id, c.medicine_id, c.quantity, m.name as medicine_name, m.rx as rx_required
       FROM cart_items c
       JOIN medicines m ON c.medicine_id = m.id
       WHERE c.user_id = $1`,
      [user_id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Check if any item requires a prescription
    const rxItems = cartResult.rows.filter(item => item.rx_required);
    if (rxItems.length > 0) {
      await client.query('ROLLBACK');
      const rxNames = rxItems.map(i => i.medicine_name).join(', ');
      return res.status(403).json({
        error: 'Prescription required',
        message: `The following medicines require a valid prescription before pickup: ${rxNames}. Please upload your prescription in the Prescriptions section.`,
        rx_items: rxNames,
      });
    }

    // 2. Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status) VALUES ($1, 'pending_pickup') RETURNING *`,
      [user_id]
    );
    const order = orderResult.rows[0];

    // 3. Insert each cart item into order_items
    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.medicine_id, item.medicine_name, item.quantity]
      );
    }

    // 4. Clear the user's cart
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
