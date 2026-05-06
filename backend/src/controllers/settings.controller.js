const db = require('../config/db');
const {
  ValidationError,
  ensureUserRecord,
  ensureUserSettings,
  hasOwnProperty,
  mapSettingsRow,
} = require('../utils/account.utils');

const allowedThemes = new Set(['light', 'dark', 'system']);
const allowedSidebarDensities = new Set(['compact', 'default', 'relaxed']);

function readBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }

  return value;
}

function readAppearanceOption(value, allowedValues, fieldName) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalizedValue = value.trim().toLowerCase();

  if (!allowedValues.has(normalizedValue)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${Array.from(allowedValues).join(', ')}`
    );
  }

  return normalizedValue;
}

exports.getSettings = async (req, res) => {
  try {
    await ensureUserRecord(req.user);
    const settingsRecord = await ensureUserSettings(req.user.firebase_uid);

    return res.status(200).json({
      settings: mapSettingsRow(settingsRecord),
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Internal server error while fetching settings' });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    await ensureUserRecord(req.user);
    const currentSettings = await ensureUserSettings(req.user.firebase_uid);
    const requestBody = req.body || {};

    const nextOrderAlerts = hasOwnProperty(requestBody, 'orderAlerts')
      ? readBoolean(requestBody.orderAlerts, 'orderAlerts')
      : currentSettings.order_alerts;

    const nextLowStockAlerts = hasOwnProperty(requestBody, 'lowStockAlerts')
      ? readBoolean(requestBody.lowStockAlerts, 'lowStockAlerts')
      : currentSettings.low_stock_alerts;

    const nextExpiryAlerts = hasOwnProperty(requestBody, 'expiryAlerts')
      ? readBoolean(requestBody.expiryAlerts, 'expiryAlerts')
      : currentSettings.expiry_alerts;

    const nextWeeklyReports = hasOwnProperty(requestBody, 'weeklyReports')
      ? readBoolean(requestBody.weeklyReports, 'weeklyReports')
      : currentSettings.weekly_reports;

    const query = `
      UPDATE user_settings
      SET
        order_alerts = $1,
        low_stock_alerts = $2,
        expiry_alerts = $3,
        weekly_reports = $4,
        updated_at = NOW()
      WHERE user_id = $5
      RETURNING *;
    `;

    const result = await db.query(query, [
      nextOrderAlerts,
      nextLowStockAlerts,
      nextExpiryAlerts,
      nextWeeklyReports,
      req.user.firebase_uid,
    ]);

    return res.status(200).json({
      message: 'Notification settings updated successfully',
      settings: mapSettingsRow(result.rows[0]),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error updating notification settings:', error);
    return res.status(500).json({
      error: 'Internal server error while updating notification settings',
    });
  }
};

exports.updateAppearanceSettings = async (req, res) => {
  try {
    await ensureUserRecord(req.user);
    const currentSettings = await ensureUserSettings(req.user.firebase_uid);
    const requestBody = req.body || {};

    const nextTheme = hasOwnProperty(requestBody, 'theme')
      ? readAppearanceOption(requestBody.theme, allowedThemes, 'theme')
      : currentSettings.theme;

    const nextSidebarDensity = hasOwnProperty(requestBody, 'sidebarDensity')
      ? readAppearanceOption(
          requestBody.sidebarDensity,
          allowedSidebarDensities,
          'sidebarDensity'
        )
      : currentSettings.sidebar_density;

    const query = `
      UPDATE user_settings
      SET
        theme = $1,
        sidebar_density = $2,
        updated_at = NOW()
      WHERE user_id = $3
      RETURNING *;
    `;

    const result = await db.query(query, [
      nextTheme,
      nextSidebarDensity,
      req.user.firebase_uid,
    ]);

    return res.status(200).json({
      message: 'Appearance settings updated successfully',
      settings: mapSettingsRow(result.rows[0]),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error updating appearance settings:', error);
    return res.status(500).json({
      error: 'Internal server error while updating appearance settings',
    });
  }
};
