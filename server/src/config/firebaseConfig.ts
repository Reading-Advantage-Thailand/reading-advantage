import admin from 'firebase-admin';
import serviceAccount from './service_account_key.json';
admin.initializeApp({
    credential: admin.credential.cert(
        serviceAccount as admin.ServiceAccount
    ),
});

const db = admin.firestore();

export default db;