const db = require('../config/db');

exports.addToCart = async (req, res) => {
  try {
    const { medicine_id, quantity = 1 } = req.body;
    const user_id = req.user.firebase_uid; // From auth middleware

    if (!medicine_id) {
      return res.status(400).json({ error: 'Medicine ID is required' });
    }

    const medQuery = `SELECT m.name, md.dose_interval_days FROM medicines m LEFT JOIN medicine_details md ON md.medicine_id = m.id WHERE m.id = $1`;
    const medRes = await db.query(medQuery, [medicine_id]);
    if (medRes.rowCount === 0) return res.status(404).json({error: 'Medicine not found'});
    
    const doseInterval = medRes.rows[0].dose_interval_days || 0;
    if (doseInterval > 0) {
      const doseQuery = `
        SELECT o.created_at 
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.user_id = $1 AND oi.medicine_id = $2 AND o.status != 'rejected'
          AND o.created_at >= NOW() - INTERVAL '1 day' * $3
        LIMIT 1
      `;
      const doseRes = await db.query(doseQuery, [user_id, medicine_id, doseInterval]);
      if (doseRes.rowCount > 0) {
        return res.status(403).json({ error: `You cannot order ${medRes.rows[0].name} until your ${doseInterval}-day dose is complete.` });
      }
    }

    const conflictQuery = `
      SELECT di.severity, di.clinical_description, m.name as conflicting_medicine
      FROM drug_interactions di
      JOIN medicines m ON (m.id = di.medicine_a_id OR m.id = di.medicine_b_id)
      WHERE (di.medicine_a_id = $1 OR di.medicine_b_id = $1)
        AND m.id != $1
        AND (
          m.id IN (SELECT medicine_id FROM cart_items WHERE user_id = $2)
          OR
          m.id IN (
            SELECT oi.medicine_id 
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.user_id = $2 
              AND o.status != 'rejected'
              AND o.created_at >= NOW() - INTERVAL '7 days'
          )
        )
      LIMIT 1
    `;
    const conflictResult = await db.query(conflictQuery, [medicine_id, user_id]);
    
    if (conflictResult.rows.length > 0) {
      const conflict = conflictResult.rows[0];
      return res.status(409).json({
        error: 'Interaction Warning',
        severity: conflict.severity,
        message: `Interaction Warning: Cannot add medication due to a ${conflict.severity} interaction with ${conflict.conflicting_medicine}. ${conflict.clinical_description}`,
        conflictingMedicine: conflict.conflicting_medicine,
        clinicalDescription: conflict.clinical_description
      });
    }

    // Upsert logic: If it exists, add the quantity. Otherwise, insert.
    const query = `
      INSERT INTO cart_items (user_id, medicine_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, medicine_id) 
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING *;
    `;
    
    const result = await db.query(query, [user_id, medicine_id, quantity]);

    res.status(200).json({
      message: 'Item added to cart successfully',
      item: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal server error while adding to cart' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user_id = req.user.firebase_uid;

    const query = `
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        m.id as medicine_id,
        m.name,
        m.rx as rx_required,
        m.category,
        m.stock as available,
        COALESCE(md.price, 0.00) as price
      FROM cart_items c
      JOIN medicines m ON c.medicine_id = m.id
      LEFT JOIN medicine_details md ON md.medicine_id = m.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC;
    `;
    
    const result = await db.query(query, [user_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error while fetching cart' });
  }
};

// PATCH /api/v1/cart/:cartItemId — update quantity of a specific item
exports.updateQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const user_id = req.user.firebase_uid;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const result = await db.query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, cartItemId, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Quantity updated', item: result.rows[0] });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Internal server error while updating quantity' });
  }
};

// DELETE /api/v1/cart/:cartItemId — remove a single item
exports.removeItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const user_id = req.user.firebase_uid;

    const result = await db.query(
      `DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *`,
      [cartItemId, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Internal server error while removing item' });
  }
};

// DELETE /api/v1/cart — clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const user_id = req.user.firebase_uid;

    await db.query(`DELETE FROM cart_items WHERE user_id = $1`, [user_id]);

    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Internal server error while clearing cart' });
  }
};
