const db = require('../config/db');

class ValidationError extends Error {}

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeOptionalText(value, { fieldName = 'value', maxLength = 255 } = {}) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.length > maxLength) {
    throw new ValidationError(`${fieldName} must be ${maxLength} characters or less`);
  }

  return trimmedValue;
}

function splitFullName(fullName = '') {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' '),
  };
}

function buildFullName(firstName = '', lastName = '') {
  const normalizedFirstName = typeof firstName === 'string' ? firstName.trim() : '';
  const normalizedLastName = typeof lastName === 'string' ? lastName.trim() : '';
  const fullName = [normalizedFirstName, normalizedLastName].filter(Boolean).join(' ').trim();

  return fullName || null;
}

function mapProfileRow(row) {
  const { firstName, lastName } = splitFullName(row.full_name || '');

  return {
    id: row.id.toString(),
    firebaseUid: row.firebase_uid,
    email: row.email,
    fullName: row.full_name || '',
    firstName,
    lastName,
    phone: row.phone || '',
    department: row.department || '',
    bloodGroup: row.blood_group || '',
    allergies: row.allergies || '',
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSettingsRow(row) {
  return {
    notifications: {
      orderAlerts: row.order_alerts,
      lowStockAlerts: row.low_stock_alerts,
      expiryAlerts: row.expiry_alerts,
      weeklyReports: row.weekly_reports,
    },
    appearance: {
      theme: row.theme,
      sidebarDensity: row.sidebar_density,
    },
    updatedAt: row.updated_at,
  };
}

async function ensureUserRecord(authUser, profileValues = {}, options = {}) {
  const fallbackName = authUser.name || authUser.email.split('@')[0];
  const fullName =
    profileValues.fullName === undefined ? fallbackName : profileValues.fullName;
  const touchUpdatedAt = options.touchUpdatedAt === true;
  const updateTimestampClause = touchUpdatedAt ? ', updated_at = NOW()' : '';

  const query = `
    INSERT INTO users (
      firebase_uid,
      email,
      full_name,
      phone,
      department,
      blood_group,
      allergies
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (firebase_uid)
    DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, users.full_name),
      phone = COALESCE(EXCLUDED.phone, users.phone),
      department = COALESCE(EXCLUDED.department, users.department),
      blood_group = COALESCE(EXCLUDED.blood_group, users.blood_group),
      allergies = COALESCE(EXCLUDED.allergies, users.allergies)
      ${updateTimestampClause}
    RETURNING
      id,
      firebase_uid,
      email,
      full_name,
      phone,
      department,
      blood_group,
      allergies,
      role,
      created_at,
      updated_at;
  `;

  const values = [
    authUser.firebase_uid,
    authUser.email,
    fullName,
    profileValues.phone,
    profileValues.department,
    profileValues.bloodGroup,
    profileValues.allergies,
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code !== '23505' || error.constraint !== 'users_email_key') {
      throw error;
    }

    const linkTimestampClause = touchUpdatedAt ? ', updated_at = NOW()' : '';

    const linkQuery = `
      UPDATE users
      SET
        firebase_uid = $1,
        full_name = COALESCE($2, full_name),
        phone = COALESCE($3, phone),
        department = COALESCE($4, department),
        blood_group = COALESCE($5, blood_group),
        allergies = COALESCE($6, allergies)
        ${linkTimestampClause}
      WHERE email = $7
      RETURNING
        id,
        firebase_uid,
        email,
        full_name,
        phone,
        department,
        blood_group,
        allergies,
        role,
        created_at,
        updated_at;
    `;

    const linkValues = [
      authUser.firebase_uid,
      fullName,
      profileValues.phone,
      profileValues.department,
      profileValues.bloodGroup,
      profileValues.allergies,
      authUser.email,
    ];

    const linkedResult = await db.query(linkQuery, linkValues);

    if (linkedResult.rowCount === 0) {
      throw error;
    }

    return linkedResult.rows[0];
  }
}

async function ensureUserSettings(firebaseUid) {
  const query = `
    WITH inserted AS (
      INSERT INTO user_settings (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    )
    SELECT * FROM inserted
    UNION ALL
    SELECT *
    FROM user_settings
    WHERE user_id = $1
      AND NOT EXISTS (SELECT 1 FROM inserted);
  `;

  const result = await db.query(query, [firebaseUid]);
  return result.rows[0];
}

module.exports = {
  ValidationError,
  buildFullName,
  ensureUserRecord,
  ensureUserSettings,
  hasOwnProperty,
  mapProfileRow,
  mapSettingsRow,
  normalizeOptionalText,
  splitFullName,
};
