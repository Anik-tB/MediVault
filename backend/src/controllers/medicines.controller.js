const db = require('../config/db');

exports.getMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = 'SELECT m.*, md.price FROM medicines m LEFT JOIN medicine_details md ON md.medicine_id = m.id';
    const params = [];
    const conditions = [];

    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY m.name ASC';

    const result = await db.query(query, params);
    
    // Map db columns to frontend expectations
    const medicines = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      rx: row.rx,
      certificate: row.certificate,
      category: row.category,
      categoryIcon: row.category_icon,
      description: row.description,
      stock: row.stock,
      price: Number(row.price || 0)
    }));

    res.status(200).json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Internal server error while fetching medicines' });
  }
};
