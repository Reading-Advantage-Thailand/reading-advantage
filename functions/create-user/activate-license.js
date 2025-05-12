const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require("../service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// License Key ที่จะใช้
const licenseKey = 'ใส่ License Key ที่นี่';

// ตัวอย่างอีเมลที่ต้องการเปิดใช้งาน License
const emailsToActivate = [
  "test1@gmail.com",
  "test2@gmail.com",
];

// ฟังก์ชันสำหรับเปิดใช้งาน License ในแบบ batch
const activateLicense = async (emails) => {
    try {
        if (!Array.isArray(emails) || emails.length === 0) {
            console.log('Please provide a list of emails');
            return;
        }

        console.log('Starting license activation process...');
        console.log('Emails to activate:', emails);

        // ค้นหา License ด้วย key เดียว
        const licenseRef = db.collection('licenses').where('key', '==', licenseKey);
        const licenseSnapshot = await licenseRef.get();

        if (licenseSnapshot.empty) {
            console.log('License not found');
            return;
        }

        const licenseData = licenseSnapshot.docs.map(doc => doc.data())[0];
        console.log('License data:', licenseData);

        if (licenseData.total_licenses <= licenseData.used_licenses) {
            console.log('License is already used');
            return;
        }

        // ใช้ Promise.all เพื่อทำงานกับผู้ใช้หลายคนพร้อมกัน
        const updatePromises = emails.map(async (email) => {
            console.log(`Processing email: ${email}`);

            // หา userId จากอีเมล
            const userQuery = await db.collection('users').where('email', '==', email).get();

            if (userQuery.empty) {
                console.log(`User not found for email: ${email}`);
                return { email, message: 'User not found' };
            }

            const userData = userQuery.docs[0].data();
            const userId = userQuery.docs[0].id;
            console.log(`User data for email ${email}:`, userData);

            if (userData.license_id === licenseData.id) {
                console.log(`License already activated for email: ${email}`);
                return { email, message: 'License already activated' };
            }

            // อัปเดต License และข้อมูลผู้ใช้
            console.log(`Activating license for email: ${email}`);
            await db.collection('licenses').doc(licenseData.id).update({
                used_licenses: licenseData.used_licenses + emails.length,
            });

            await db.collection('users').doc(userId).update({
                expired_date: licenseData.expiration_date,
                license_id: licenseData.id,
            });

            console.log(`License activated successfully for email: ${email}`);
            return { email, message: 'License activated successfully' };
        });

        // รอให้ทุกการอัปเดตเสร็จสิ้น
        const results = await Promise.all(updatePromises);

        // แสดงผลลัพธ์ทั้งหมด
        console.log('Activation completed');

    } catch (error) {
        console.error('Error:', error);
    }
};

// เรียกใช้งานฟังก์ชัน
activateLicense(emailsToActivate);

