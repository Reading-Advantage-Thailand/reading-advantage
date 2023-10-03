import admin from 'firebase-admin';
// const credentials = require('../service-account.json');
// import dotenv from 'dotenv';

// dotenv.config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);
// const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
// Check if the app has already been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

const db = admin.firestore();
const storage = admin.storage();
const app = admin.app();

export { db, storage, app };
