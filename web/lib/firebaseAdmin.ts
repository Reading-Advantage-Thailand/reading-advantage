import * as admin from "firebase-admin"
import type { ServiceAccount } from "firebase-admin"

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
const cert: ServiceAccount | null =
    privateKey && process.env.FIREBASE_CLIENT_EMAIL
        ? {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
        }
        : null

export const firebaseAdmin =
    admin.apps[0] ??
    admin.initializeApp(
        cert
            ? { credential: admin.credential.cert(cert) }
            : { projectId: process.env.FIREBASE_PROJECT_ID }
    )
