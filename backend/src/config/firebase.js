const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '../../serviceAccountKey.json');

try {
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } else {
    console.warn('\n======================================================');
    console.warn('⚠️ WARNING: serviceAccountKey.json not found!');
    console.warn('⚠️ Please generate it from Firebase Console -> Project Settings -> Service Accounts');
    console.warn('⚠️ and place it in the "backend" directory as "serviceAccountKey.json"');
    console.warn('======================================================\n');
    
    // Initialize without credentials. Token verification will fail until key is provided.
    admin.initializeApp(); 
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

module.exports = admin;
