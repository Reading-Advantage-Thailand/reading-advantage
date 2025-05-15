const admin = require("firebase-admin");
const fs = require("fs");

// Init Firebase
const serviceAccount = require("../service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));

// วันหมดอายุ (เช่น 1 ปีจากวันนี้)
const expiredDate = new Date(Date.now() + 365 * 86400000);

async function createUsers(users) {
  for (const user of users) {
    try {
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(user.email);
        console.log(`⚠️  User already exists: ${user.email}`);
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          userRecord = await admin.auth().createUser({
            email: user.email,
            password: user.password,
            displayName: user.displayName,
          });
          console.log(`✅ Created user: ${user.email}`);
        } else {
          throw error;
        }
      }

      // Set custom claims
      if (user.role) {
        await admin
          .auth()
          .setCustomUserClaims(userRecord.uid, { role: user.role });
        console.log(`🔑 Set role "${user.role}" for ${user.email}`);
      }

      // Add to Firestore
      const createdAt = admin.firestore.Timestamp.now();
      const data = {
        id: userRecord.uid,
        email: user.email,
        display_name: user.displayName,
        role: user.role,
        level: 0,
        email_verified: userRecord.emailVerified || false,
        picture: userRecord.photoURL || "",
        xp: 0,
        cefr_level: "",
        expired_date: expiredDate.toISOString(),
        expired: false,
        license_id: user.license_id,
        sign_in_provider: "password",
        created_at: createdAt,
      };

      await db.collection("users").doc(userRecord.uid).set(data);
      console.log(`📄 Firestore document created for ${user.email}`);
    } catch (err) {
      console.error(`❌ Error processing ${user.email}:`, err.message);
    }
  }
}

createUsers(users);
