const db = require('../config/db');
const {
  ValidationError,
  buildFullName,
  ensureUserRecord,
  hasOwnProperty,
  mapProfileRow,
  normalizeOptionalText,
  splitFullName,
} = require('../utils/account.utils');

exports.getProfile = async (req, res) => {
  try {
    const userRecord = await ensureUserRecord(req.user);

    return res.status(200).json({
      profile: mapProfileRow(userRecord),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Internal server error while fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const currentUserRecord = await ensureUserRecord(req.user);
    const currentNameParts = splitFullName(currentUserRecord.full_name || '');
    const requestBody = req.body || {};

    if (
      hasOwnProperty(requestBody, 'email') &&
      typeof requestBody.email === 'string' &&
      requestBody.email.trim().toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(400).json({
        error: 'Email is managed by Firebase Auth and cannot be changed here.',
      });
    }

    const firstName = hasOwnProperty(requestBody, 'firstName')
      ? normalizeOptionalText(requestBody.firstName, {
          fieldName: 'firstName',
          maxLength: 80,
        })
      : currentNameParts.firstName;

    const lastName = hasOwnProperty(requestBody, 'lastName')
      ? normalizeOptionalText(requestBody.lastName, {
          fieldName: 'lastName',
          maxLength: 80,
        })
      : currentNameParts.lastName;

    const nextFullName =
      buildFullName(firstName || '', lastName || '') ||
      currentUserRecord.full_name ||
      req.user.name ||
      req.user.email.split('@')[0];

    const nextPhone = hasOwnProperty(requestBody, 'phone')
      ? normalizeOptionalText(requestBody.phone, {
          fieldName: 'phone',
          maxLength: 30,
        })
      : currentUserRecord.phone;

    const nextDepartment = hasOwnProperty(requestBody, 'department')
      ? normalizeOptionalText(requestBody.department, {
          fieldName: 'department',
          maxLength: 120,
        })
      : currentUserRecord.department;

    const nextBloodGroup = hasOwnProperty(requestBody, 'bloodGroup')
      ? normalizeOptionalText(requestBody.bloodGroup, {
          fieldName: 'bloodGroup',
          maxLength: 10,
        })
      : currentUserRecord.blood_group;

    const nextAllergies = hasOwnProperty(requestBody, 'allergies')
      ? normalizeOptionalText(requestBody.allergies, {
          fieldName: 'allergies',
          maxLength: 500,
        })
      : currentUserRecord.allergies;

    const query = `
      UPDATE users
      SET
        full_name = $1,
        phone = $2,
        department = $3,
        blood_group = $4,
        allergies = $5,
        updated_at = NOW()
      WHERE firebase_uid = $6
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

    const result = await db.query(query, [
      nextFullName,
      nextPhone,
      nextDepartment,
      nextBloodGroup,
      nextAllergies,
      req.user.firebase_uid,
    ]);

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: mapProfileRow(result.rows[0]),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error while updating profile' });
  }
};
