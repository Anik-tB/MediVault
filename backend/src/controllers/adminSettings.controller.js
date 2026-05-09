const db = require('../config/db');
const {
  AdminValidationError,
  createPasswordRecord,
  handleAdminError,
  mapStaff,
  normalizeBoolean,
  normalizeText,
  verifyPassword,
} = require('../utils/admin.utils');

const allowedThemes = new Set(['light', 'dark', 'system']);
const allowedDensities = new Set(['compact', 'default', 'relaxed']);

function requireOption(value, allowed, fieldName) {
  const normalized = normalizeText(value, { fieldName, maxLength: 30, required: true }).toLowerCase();
  if (!allowed.has(normalized)) {
    throw new AdminValidationError(`${fieldName} must be one of: ${Array.from(allowed).join(', ')}`);
  }
  return normalized;
}

async function getCurrentStaff(staffId) {
  const result = await db.query(`SELECT * FROM staff_users WHERE id = $1`, [staffId]);
  if (result.rowCount === 0) {
    throw new AdminValidationError('Staff account not found');
  }
  return result.rows[0];
}

exports.getStaffSettings = async (req, res) => {
  try {
    const staff = await getCurrentStaff(req.staff.id);
    return res.status(200).json({ staff: mapStaff(staff) });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while fetching staff settings');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const staff = await getCurrentStaff(req.staff.id);
    const fullName = normalizeText(req.body?.fullName, {
      fieldName: 'Full name',
      maxLength: 150,
    }) || staff.full_name;
    const phone = normalizeText(req.body?.phone, {
      fieldName: 'Phone number',
      maxLength: 30,
    });
    const department = normalizeText(req.body?.department, {
      fieldName: 'Department',
      maxLength: 120,
    }) || staff.department;

    const result = await db.query(
      `UPDATE staff_users
       SET full_name = $1,
           phone = $2,
           department = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [fullName, phone, department, staff.id]
    );

    return res.status(200).json({
      message: 'Profile settings updated successfully',
      staff: mapStaff(result.rows[0]),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while updating profile settings');
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const staff = await getCurrentStaff(req.staff.id);
    const body = req.body || {};
    const values = {
      orderAlerts: body.orderAlerts === undefined ? staff.order_alerts : normalizeBoolean(body.orderAlerts, 'Order alerts'),
      lowStockAlerts: body.lowStockAlerts === undefined ? staff.low_stock_alerts : normalizeBoolean(body.lowStockAlerts, 'Low stock alerts'),
      expiryAlerts: body.expiryAlerts === undefined ? staff.expiry_alerts : normalizeBoolean(body.expiryAlerts, 'Expiry alerts'),
      weeklyReports: body.weeklyReports === undefined ? staff.weekly_reports : normalizeBoolean(body.weeklyReports, 'Weekly reports'),
    };

    const result = await db.query(
      `UPDATE staff_users
       SET order_alerts = $1,
           low_stock_alerts = $2,
           expiry_alerts = $3,
           weekly_reports = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [values.orderAlerts, values.lowStockAlerts, values.expiryAlerts, values.weeklyReports, staff.id]
    );

    return res.status(200).json({
      message: 'Notification settings updated successfully',
      staff: mapStaff(result.rows[0]),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while updating notification settings');
  }
};

exports.updateAppearance = async (req, res) => {
  try {
    const staff = await getCurrentStaff(req.staff.id);
    const body = req.body || {};
    const theme = body.theme === undefined ? staff.theme : requireOption(body.theme, allowedThemes, 'Theme');
    const sidebarDensity = body.sidebarDensity === undefined ? staff.sidebar_density : requireOption(body.sidebarDensity, allowedDensities, 'Sidebar density');

    const result = await db.query(
      `UPDATE staff_users
       SET theme = $1,
           sidebar_density = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [theme, sidebarDensity, staff.id]
    );

    return res.status(200).json({
      message: 'Appearance settings updated successfully',
      staff: mapStaff(result.rows[0]),
    });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while updating appearance settings');
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const staff = await getCurrentStaff(req.staff.id);
    const currentPassword = normalizeText(req.body?.currentPassword, {
      fieldName: 'Current password',
      maxLength: 200,
      required: true,
    });
    const newPassword = normalizeText(req.body?.newPassword, {
      fieldName: 'New password',
      maxLength: 200,
      required: true,
    });

    if (!verifyPassword(currentPassword, staff)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordRecord = createPasswordRecord(newPassword);

    await db.query(
      `UPDATE staff_users
       SET password_hash = $1,
           password_salt = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [passwordRecord.passwordHash, passwordRecord.passwordSalt, staff.id]
    );

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return handleAdminError(res, error, 'Internal server error while updating password');
  }
};
