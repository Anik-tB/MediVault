const admin = require('../config/firebase');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Check if admin is actually configured with credentials
    if (!admin.app().options.credential) {
      console.warn('⚠️ WARNING: Bypassing real verification because serviceAccountKey.json is missing.');
      // For development ONLY, if no service account is present, we might mock it if needed.
      // But ideally we should enforce it. We will reject if no credentials.
      return res.status(500).json({ error: 'Server configuration error: Firebase Admin not configured.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      firebase_uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split('@')[0],
      email_verified: decodedToken.email_verified,
    };

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = {
  verifyFirebaseToken,
};
