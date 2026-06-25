import admin from "firebase-admin";

const rawServiceAccount = process.env.SERVICE_ACCOUNT_KEY;
const serviceAccount = rawServiceAccount ? JSON.parse(rawServiceAccount) : null;

// Check if the app has already been initialized
if (!admin.apps.length) {
  const appOptions =
    serviceAccount?.private_key && serviceAccount?.client_email
      ? { credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) }
      : { projectId: process.env.FIREBASE_PROJECT_ID };

  admin.initializeApp(appOptions);
}

const db = admin.firestore();

export default db;
