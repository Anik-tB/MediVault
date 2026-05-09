const db = require('../config/db');
const {
  AdminValidationError,
  handleAdminError,
  normalizeBoolean,
  normalizeDate,
  normalizeInteger,
  normalizeText,
} = require('../utils/admin.utils');

function getStockStatus(stock) {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 50) return 'low_stock';
  return 'in_stock';
}

function mapMedicine(row, interactionCounts = {}) {
  const stock = Number(row.stock || 0);
  const conflictCount = Number(row.conflict_count ?? interactionCounts[row.id] ?? 0);

  return {
    id: row.id,
    name: row.name,
    category: row.category || '',
    categoryIcon: row.category_icon || '',
    description: row.description || '',
    stock,
    expiryDate: row.expiry_date,
    rx: Boolean(row.rx),
    certificate: Boolean(row.certificate),
    status: getStockStatus(stock),
    conflictCount,
  };
}

async function readInteractionCounts() {
  const result = await db.query(
    `SELECT medicine_id, SUM(count) AS conflict_count
     FROM (
       SELECT medicine_a_id AS medicine_id, COUNT(*) AS count FROM drug_interactions GROUP BY medicine_a_id
       UNION ALL
       SELECT medicine_b_id AS medicine_id, COUNT(*) AS count FROM drug_interactions GROUP BY medicine_b_id
     ) conflicts
     GROUP BY medicine_id`
  );

  return result.rows.reduce((acc, row) => {
    acc[row.medicine_id] = Number(row.conflict_count);
    return acc;
  }, {});
}

exports.getAdminMedicines = async (req, res) => {
  try {
    const search = normalizeText(req.query?.search, { fieldName: 'Search', maxLength: 120 });
    const category = normalizeText(req.query?.category, { fieldName: 'Category', maxLength: 100 });
    const status = normalizeText(req.query?.status, { fieldName: 'Status', maxLength: 30 });

    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(m.name ILIKE $${params.length} OR m.description ILIKE $${params.length} OR m.category ILIKE $${params.length})`);
    }

    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`m.category = $${params.length}`);
    }

    if (status === 'in_stock') {
      conditions.push('m.stock > 50');
    } else if (status === 'low_stock') {
      conditions.push('m.stock > 0 AND m.stock <= 50');
    } else if (status === 'out_of_stock') {
      conditions.push('m.stock <= 0');
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [medicineResult, counts] = await Promise.all([
      db.query(
        `SELECT m.*,
           COALESCE(conflict_counts.conflict_count, 0) AS conflict_count
         FROM medicines m
         LEFT JOIN (
           SELECT medicine_id, SUM(count) AS conflict_count
           FROM (
             SELECT medicine_a_id AS medicine_id, COUNT(*) AS count FROM drug_interactions GROUP BY medicine_a_id
             UNION ALL
             SELECT medicine_b_id AS medicine_id, COUNT(*) AS count FROM drug_interactions GROUP BY medicine_b_id
           ) c
           GROUP BY medicine_id
         ) conflict_counts ON conflict_counts.medicine_id = m.id
         ${whereClause}
         ORDER BY m.name ASC`,
        params
      ),
      readInteractionCounts(),
    ]);

    const medicines = medicineResult.rows.map((row) => mapMedicine(row, counts));
    const categories = [...new Set(medicines.map((medicine) => medicine.category).filter(Boolean))].sort();

    return res.status(200).json({
      medicines,
      categories,
      stats: {
        total: medicines.length,
        inStock: medicines.filter((medicine) => medicine.status === 'in_stock').length,
        lowStock: medicines.filter((medicine) => medicine.status === 'low_stock').length,
        outOfStock: medicines.filter((medicine) => medicine.status === 'out_of_stock').length,
      },
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while fetching medicines');
  }
};

function readMedicinePayload(body, { partial = false } = {}) {
  const values = {};

  if (!partial || body.name !== undefined) {
    values.name = normalizeText(body.name, { fieldName: 'Medicine name', maxLength: 255, required: !partial });
  }
  if (!partial || body.category !== undefined) {
    values.category = normalizeText(body.category, { fieldName: 'Category', maxLength: 100, required: !partial });
  }
  if (!partial || body.description !== undefined) {
    values.description = normalizeText(body.description, { fieldName: 'Description', maxLength: 2000, required: !partial });
  }
  if (!partial || body.stock !== undefined) {
    values.stock = normalizeInteger(body.stock, { fieldName: 'Stock quantity', min: 0, max: 999999 });
  }
  if (!partial || body.expiryDate !== undefined) {
    values.expiryDate = normalizeDate(body.expiryDate, 'Expiry date');
  }
  if (!partial || body.rx !== undefined) {
    values.rx = normalizeBoolean(Boolean(body.rx), 'Prescription required');
  }
  if (!partial || body.certificate !== undefined) {
    values.certificate = normalizeBoolean(Boolean(body.certificate), 'Certificate/conflict flag');
  }

  return values;
}

exports.createMedicine = async (req, res) => {
  try {
    const payload = readMedicinePayload(req.body || {});

    const result = await db.query(
      `INSERT INTO medicines (name, category, category_icon, description, stock, expiry_date, rx, certificate)
       VALUES ($1, $2, 'activity', $3, $4, $5, $6, $7)
       RETURNING *`,
      [payload.name, payload.category, payload.description, payload.stock, payload.expiryDate, payload.rx, payload.certificate]
    );

    return res.status(201).json({
      message: 'Medicine added successfully',
      medicine: mapMedicine(result.rows[0]),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while adding medicine');
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicineId = normalizeInteger(req.params.medicineId, { fieldName: 'Medicine ID', min: 1 });
    const existingResult = await db.query(`SELECT * FROM medicines WHERE id = $1`, [medicineId]);

    if (existingResult.rowCount === 0) {
      throw new AdminValidationError('Medicine not found');
    }

    const existing = existingResult.rows[0];
    const payload = readMedicinePayload(req.body || {}, { partial: true });

    const result = await db.query(
      `UPDATE medicines
       SET name = $1,
           category = $2,
           description = $3,
           stock = $4,
           expiry_date = $5,
           rx = $6,
           certificate = $7
       WHERE id = $8
       RETURNING *`,
      [
        payload.name ?? existing.name,
        payload.category ?? existing.category,
        payload.description ?? existing.description,
        payload.stock ?? existing.stock,
        payload.expiryDate ?? existing.expiry_date,
        payload.rx ?? existing.rx,
        payload.certificate ?? existing.certificate,
        medicineId,
      ]
    );

    return res.status(200).json({
      message: 'Medicine updated successfully',
      medicine: mapMedicine(result.rows[0]),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while updating medicine');
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicineId = normalizeInteger(req.params.medicineId, { fieldName: 'Medicine ID', min: 1 });
    const result = await db.query(`DELETE FROM medicines WHERE id = $1 RETURNING id, name`, [medicineId]);

    if (result.rowCount === 0) {
      throw new AdminValidationError('Medicine not found');
    }

    return res.status(200).json({ message: `${result.rows[0].name} removed from inventory` });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while deleting medicine');
  }
};
