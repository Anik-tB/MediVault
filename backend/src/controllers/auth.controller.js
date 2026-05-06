const {
  ValidationError,
  ensureUserRecord,
  ensureUserSettings,
  hasOwnProperty,
  mapProfileRow,
  mapSettingsRow,
  normalizeOptionalText,
} = require('../utils/account.utils');

const syncProfile = async (req, res) => {
  try {
    const requestBody = req.body || {};
    const phone = hasOwnProperty(requestBody, 'phone')
      ? normalizeOptionalText(requestBody.phone, {
          fieldName: 'phone',
          maxLength: 30,
        })
      : undefined;
    const department = hasOwnProperty(requestBody, 'department')
      ? normalizeOptionalText(requestBody.department, {
          fieldName: 'department',
          maxLength: 120,
        })
      : undefined;
    const bloodGroup = hasOwnProperty(requestBody, 'bloodGroup')
      ? normalizeOptionalText(requestBody.bloodGroup, {
          fieldName: 'bloodGroup',
          maxLength: 10,
        })
      : undefined;
    const allergies = hasOwnProperty(requestBody, 'allergies')
      ? normalizeOptionalText(requestBody.allergies, {
          fieldName: 'allergies',
          maxLength: 500,
        })
      : undefined;

    const userRecord = await ensureUserRecord(req.user, {
      phone,
      department,
      bloodGroup,
      allergies,
    }, {
      touchUpdatedAt: true,
    });
    const settingsRecord = await ensureUserSettings(req.user.firebase_uid);

    return res.status(200).json({
      message: 'Profile synced successfully',
      profile: mapProfileRow(userRecord),
      settings: mapSettingsRow(settingsRecord),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error syncing profile:', error);

    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  syncProfile,
};
