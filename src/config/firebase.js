const admin = require('firebase-admin');

// Initialize Firebase
const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    
    console.log('Firebase initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    process.exit(1);
  }
};

const db = initializeFirebase();

module.exports = {
  db,
  admin
}; 