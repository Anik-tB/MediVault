const crypto = require('crypto');

const SESSION_TTL_DAYS = 7;
const HASH_ITERATIONS = 120000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = 'sha512';

class AdminValidationError extends Error {}

function normalizeText(value, { fieldName, maxLength = 255, required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new AdminValidationError(`${fieldName} is required`);
    return null;
  }

  if (typeof value !== 'string') {
    throw new AdminValidationError(`${fieldName} must be text`);
  }

  const normalized = value.trim();

  if (required && normalized.length === 0) {
    throw new AdminValidationError(`${fieldName} is required`);
  }

  if (normalized.length > maxLength) {
    throw new AdminValidationError(`${fieldName} must be ${maxLength} characters or less`);
  }

  return normalized.length > 0 ? normalized : null;
}

function normalizeBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    throw new AdminValidationError(`${fieldName} must be true or false`);
  }
  return value;
}

function normalizeInteger(value, { fieldName, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    throw new AdminValidationError(`${fieldName} must be an integer between ${min} and ${max}`);
  }

  return numberValue;
}

function normalizeDate(value, fieldName) {
  const textValue = normalizeText(value, { fieldName, maxLength: 30 });
  if (!textValue) return null;

  const parsed = new Date(textValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new AdminValidationError(`${fieldName} must be a valid date`);
  }

  return textValue.slice(0, 10);
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString('hex');
}

function createPasswordRecord(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AdminValidationError('Password must be at least 8 characters');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  return {
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
  };
}

function verifyPassword(password, staffRow) {
  if (!staffRow || !staffRow.password_hash || !staffRow.password_salt) return false;
  const attemptedHash = hashPassword(password, staffRow.password_salt);
  return crypto.timingSafeEqual(Buffer.from(attemptedHash), Buffer.from(staffRow.password_hash));
}

function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getSessionExpiryDate() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SESSION_TTL_DAYS);
  return expiry;
}

function mapStaff(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    firstName: (row.full_name || '').split(' ')[0] || '',
    lastName: (row.full_name || '').split(' ').slice(1).join(' ') || '',
    email: row.email,
    employeeId: row.employee_id || '',
    phone: row.phone || '',
    department: row.department || '',
    role: row.role || 'System Administrator',
    isActive: Boolean(row.is_active),
    notificationSettings: {
      orderAlerts: Boolean(row.order_alerts),
      lowStockAlerts: Boolean(row.low_stock_alerts),
      expiryAlerts: Boolean(row.expiry_alerts),
      weeklyReports: Boolean(row.weekly_reports),
    },
    appearance: {
      theme: row.theme || 'light',
      sidebarDensity: row.sidebar_density || 'default',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function handleAdminError(res, error, fallbackMessage) {
  if (error instanceof AdminValidationError) {
    return res.status(400).json({ error: error.message });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ error: fallbackMessage });
}

module.exports = {
  AdminValidationError,
  createPasswordRecord,
  createSessionToken,
  getSessionExpiryDate,
  handleAdminError,
  hashToken,
  mapStaff,
  normalizeBoolean,
  normalizeDate,
  normalizeInteger,
  normalizeText,
  verifyPassword,
};
