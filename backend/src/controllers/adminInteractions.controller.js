const db = require('../config/db');
const {
  AdminValidationError,
  handleAdminError,
  normalizeInteger,
  normalizeText,
} = require('../utils/admin.utils');

const allowedSeverities = new Set(['mild', 'moderate', 'severe']);

function normalizeSeverity(value) {
  const severity = normalizeText(value, {
    fieldName: 'Severity',
    maxLength: 20,
    required: true,
  }).toLowerCase();

  if (!allowedSeverities.has(severity)) {
    throw new AdminValidationError('Severity must be mild, moderate, or severe');
  }

  return severity;
}

function mapInteraction(row) {
  return {
    id: row.id,
    medicineAId: row.medicine_a_id,
    medicineAName: row.medicine_a_name,
    medicineBId: row.medicine_b_id,
    medicineBName: row.medicine_b_name,
    severity: row.severity,
    clinicalDescription: row.clinical_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

exports.getAdminInteractions = async (req, res) => {
  try {
    const search = normalizeText(req.query?.search, { fieldName: 'Search', maxLength: 120 });
    const severity = normalizeText(req.query?.severity, { fieldName: 'Severity', maxLength: 20 });
    const params = [];
    const conditions = [];

    if (severity && severity !== 'all') {
      params.push(severity);
      conditions.push(`di.severity = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(ma.name ILIKE $${params.length} OR mb.name ILIKE $${params.length} OR di.clinical_description ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [interactionsResult, medicinesResult] = await Promise.all([
      db.query(
        `SELECT
           di.*,
           ma.name AS medicine_a_name,
           mb.name AS medicine_b_name
         FROM drug_interactions di
         JOIN medicines ma ON ma.id = di.medicine_a_id
         JOIN medicines mb ON mb.id = di.medicine_b_id
         ${whereClause}
         ORDER BY
           CASE di.severity WHEN 'severe' THEN 1 WHEN 'moderate' THEN 2 ELSE 3 END,
           ma.name ASC`,
        params
      ),
      db.query(`SELECT id, name FROM medicines ORDER BY name ASC`),
    ]);

    const interactions = interactionsResult.rows.map(mapInteraction);

    return res.status(200).json({
      interactions,
      medicines: medicinesResult.rows.map((row) => ({ id: row.id, name: row.name })),
      stats: {
        total: interactions.length,
        mild: interactions.filter((item) => item.severity === 'mild').length,
        moderate: interactions.filter((item) => item.severity === 'moderate').length,
        severe: interactions.filter((item) => item.severity === 'severe').length,
      },
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while fetching drug interactions');
  }
};

function readInteractionPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.medicineAId !== undefined) {
    payload.medicineAId = normalizeInteger(body.medicineAId, { fieldName: 'Medicine A', min: 1 });
  }
  if (!partial || body.medicineBId !== undefined) {
    payload.medicineBId = normalizeInteger(body.medicineBId, { fieldName: 'Medicine B', min: 1 });
  }
  if (payload.medicineAId && payload.medicineBId && payload.medicineAId === payload.medicineBId) {
    throw new AdminValidationError('Medicine A and Medicine B must be different');
  }
  if (!partial || body.severity !== undefined) {
    payload.severity = normalizeSeverity(body.severity);
  }
  if (!partial || body.clinicalDescription !== undefined) {
    payload.clinicalDescription = normalizeText(body.clinicalDescription, {
      fieldName: 'Clinical description',
      maxLength: 2000,
      required: !partial,
    });
  }

  return payload;
}

exports.createInteraction = async (req, res) => {
  try {
    const payload = readInteractionPayload(req.body || {});

    const result = await db.query(
      `INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, clinical_description)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [payload.medicineAId, payload.medicineBId, payload.severity, payload.clinicalDescription]
    );

    return res.status(201).json({
      message: 'Interaction rule added successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This interaction rule already exists' });
    }
    return handleAdminError(res, error, 'Internal server error while adding interaction rule');
  }
};

exports.updateInteraction = async (req, res) => {
  try {
    const interactionId = normalizeInteger(req.params.interactionId, {
      fieldName: 'Interaction ID',
      min: 1,
    });
    const existingResult = await db.query(`SELECT * FROM drug_interactions WHERE id = $1`, [interactionId]);

    if (existingResult.rowCount === 0) {
      throw new AdminValidationError('Interaction rule not found');
    }

    const existing = existingResult.rows[0];
    const payload = readInteractionPayload(req.body || {}, { partial: true });
    const medicineAId = payload.medicineAId ?? existing.medicine_a_id;
    const medicineBId = payload.medicineBId ?? existing.medicine_b_id;

    if (medicineAId === medicineBId) {
      throw new AdminValidationError('Medicine A and Medicine B must be different');
    }

    await db.query(
      `UPDATE drug_interactions
       SET medicine_a_id = $1,
           medicine_b_id = $2,
           severity = $3,
           clinical_description = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [
        medicineAId,
        medicineBId,
        payload.severity ?? existing.severity,
        payload.clinicalDescription ?? existing.clinical_description,
        interactionId,
      ]
    );

    return res.status(200).json({ message: 'Interaction rule updated successfully' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This interaction rule already exists' });
    }
    return handleAdminError(res, error, 'Internal server error while updating interaction rule');
  }
};

exports.deleteInteraction = async (req, res) => {
  try {
    const interactionId = normalizeInteger(req.params.interactionId, {
      fieldName: 'Interaction ID',
      min: 1,
    });
    const result = await db.query(`DELETE FROM drug_interactions WHERE id = $1 RETURNING id`, [interactionId]);

    if (result.rowCount === 0) {
      throw new AdminValidationError('Interaction rule not found');
    }

    return res.status(200).json({ message: 'Interaction rule deleted successfully' });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while deleting interaction rule');
  }
};
