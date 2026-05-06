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
