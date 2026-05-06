const db = require('../config/db');

exports.addToCart = async (req, res) => {
  try {
    const { medicine_id, quantity = 1 } = req.body;
    const user_id = req.user.firebase_uid; // From auth middleware

    if (!medicine_id) {
      return res.status(400).json({ error: 'Medicine ID is required' });
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
        m.stock as available
      FROM cart_items c
      JOIN medicines m ON c.medicine_id = m.id
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
