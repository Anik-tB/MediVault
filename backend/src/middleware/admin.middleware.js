const db = require('../config/db');
const { hashToken, mapStaff } = require('../utils/admin.utils');

async function verifyAdminSession(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing staff session token' });
    }

    const token = authHeader.split('Bearer ')[1];
    const tokenHash = hashToken(token);

    const result = await db.query(
      `SELECT
         s.id AS session_id,
         su.*
       FROM staff_sessions s
       JOIN staff_users su ON su.id = s.staff_id
       WHERE s.token_hash = $1
         AND s.expires_at > NOW()
         AND su.is_active = TRUE`,
      [tokenHash]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Unauthorized: invalid or expired staff session' });
    }

    req.staff = mapStaff(result.rows[0]);
    req.staffSessionId = result.rows[0].session_id;
    return next();
  } catch (error) {
    console.error('Error verifying staff session:', error);
    return res.status(500).json({ error: 'Internal server error while verifying staff session' });
  }
}

module.exports = {
  verifyAdminSession,
};
