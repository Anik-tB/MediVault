const db = require('../config/db');
const admin = require('../config/firebase');
const {
  createPasswordRecord,
  createSessionToken,
  getSessionExpiryDate,
  handleAdminError,
  hashToken,
  mapStaff,
  normalizeText,
  verifyPassword,
} = require('../utils/admin.utils');

async function createSession(staffId) {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = getSessionExpiryDate();

  await db.query(
    `INSERT INTO staff_sessions (staff_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [staffId, tokenHash, expiresAt]
  );

  return { token, expiresAt };
}

exports.login = async (req, res) => {
  try {
    const email = normalizeText(req.body?.email, {
      fieldName: 'Email address',
      maxLength: 255,
      required: true,
    }).toLowerCase();
    const password = normalizeText(req.body?.password, {
      fieldName: 'Password',
      maxLength: 200,
      required: true,
    });

    const staffResult = await db.query(
      `SELECT * FROM staff_users WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );

    if (staffResult.rowCount === 0 || !verifyPassword(password, staffResult.rows[0])) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!staffResult.rows[0].is_active) {
      return res.status(403).json({ error: 'This staff account is inactive' });
    }

    const session = await createSession(staffResult.rows[0].id);

    return res.status(200).json({
      message: 'Signed in successfully',
      token: session.token,
      expiresAt: session.expiresAt,
      staff: mapStaff(staffResult.rows[0]),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while signing in');
  }
};

exports.register = async (req, res) => {
  try {
    const fullName = normalizeText(req.body?.fullName, {
      fieldName: 'Full name',
      maxLength: 150,
      required: true,
    });
    const email = normalizeText(req.body?.email, {
      fieldName: 'Email address',
      maxLength: 255,
      required: true,
    }).toLowerCase();
    const employeeId = normalizeText(req.body?.employeeId, {
      fieldName: 'Employee ID',
      maxLength: 50,
      required: true,
    });
    const phone = normalizeText(req.body?.phone, {
      fieldName: 'Phone number',
      maxLength: 30,
    });
    const department = normalizeText(req.body?.department, {
      fieldName: 'Clinical department',
      maxLength: 120,
      required: true,
    });
    const password = normalizeText(req.body?.password, {
      fieldName: 'Password',
      maxLength: 200,
      required: true,
    });

    const { passwordHash, passwordSalt } = createPasswordRecord(password);

    const result = await db.query(
      `INSERT INTO staff_users (
         full_name,
         email,
         employee_id,
         phone,
         department,
         role,
         password_hash,
         password_salt
       ) VALUES ($1, $2, $3, $4, $5, 'Pharmacist', $6, $7)
       RETURNING *`,
      [fullName, email, employeeId, phone, department, passwordHash, passwordSalt]
    );

    const session = await createSession(result.rows[0].id);

    return res.status(201).json({
      message: 'Staff account created successfully',
      token: session.token,
      expiresAt: session.expiresAt,
      staff: mapStaff(result.rows[0]),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A staff account already exists with this email or employee ID' });
    }

    return handleAdminError(res, error, 'Internal server error while creating staff account');
  }
};

exports.getMe = async (req, res) => {
  return res.status(200).json({ staff: req.staff });
};

exports.logout = async (req, res) => {
  try {
    if (req.staffSessionId) {
      await db.query(`DELETE FROM staff_sessions WHERE id = $1`, [req.staffSessionId]);
    }
    return res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while signing out');
  }
};

/**
 * POST /admin/auth/firebase-login
 * Accepts a Firebase ID token (from email/password or Google sign-in on the web),
 * verifies it, then checks if the email belongs to a registered staff account.
 * If so, creates a staff session and returns the session token + staff profile.
 */
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body || {};

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    // Verify the ID token with firebase-admin
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired Firebase token. Please sign in again.' });
    }

    const email = (decodedToken.email || '').toLowerCase();

    if (!email) {
      return res.status(401).json({ error: 'Firebase account has no email address associated.' });
    }

    // Check staff_users for this email
    const staffResult = await db.query(
      `SELECT * FROM staff_users WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );

    if (staffResult.rowCount === 0) {
      return res.status(403).json({
        error: 'Access denied. This email is not registered as a MediVault staff account. Contact your system administrator.',
      });
    }

    if (!staffResult.rows[0].is_active) {
      return res.status(403).json({ error: 'This staff account is inactive. Contact your system administrator.' });
    }

    const session = await createSession(staffResult.rows[0].id);

    return res.status(200).json({
      message: 'Signed in successfully via Firebase',
      token: session.token,
      expiresAt: session.expiresAt,
      staff: mapStaff(staffResult.rows[0]),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while signing in via Firebase');
  }
};
