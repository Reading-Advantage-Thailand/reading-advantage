import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);

// Check if the app has already been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

const db = admin.firestore();

export default db;
