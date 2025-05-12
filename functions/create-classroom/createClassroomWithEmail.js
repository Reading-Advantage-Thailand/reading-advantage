const admin = require("firebase-admin");
const serviceAccount = require("../service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function generateClassCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createClassroom({
  classroomName,
  grade,
  title,
  teacherId,
  licenseId,
  studentEmails,
}) {
  console.log("📥 เริ่มสร้าง classroom ด้วยข้อมูล:", {
    classroomName,
    grade,
    title,
    teacherId,
    licenseId,
    studentEmails,
  });

  const classCode = generateClassCode();
  console.log("🔑 สร้าง classCode:", classCode);

  const now = new Date();
  const timestamp = admin.firestore.Timestamp.fromDate(now); // ใช้ Timestamp จาก Firebase
  console.log("⏰ Timestamp ปัจจุบัน:", timestamp);

  const student = [];

  for (const email of studentEmails) {
    console.log(`🔍 กำลังค้นหา email: ${email}`);
    const querySnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      console.log(`✅ พบ email: ${email} | studentId: ${doc.id}`);
      student.push({
        studentId: doc.id,
        lastActivity: timestamp, // ใช้ Timestamp
      });
    } else {
      console.warn(`⚠️ ไม่พบ email นี้ใน users: ${email}`);
    }
  }

  const classroomData = {
    teacherId: teacherId,
    archived: false,
    classCode: classCode,
    classroomName: classroomName,
    grade: grade,
    title: title,
    createdAt: timestamp, // ใช้ Timestamp
    license_id: licenseId,
    student: student,
  };

  // ให้ Firebase สร้าง ID อัตโนมัติ
  const docRef = await db.collection("classroom").add({
    ...classroomData,
    id: "", // ใส่ไว้ก่อน จะอัปเดตทีหลัง
  });

  console.log("🆔 สร้าง classroom สำเร็จ | docRef.id:", docRef.id);

  // อัปเดตฟิลด์ id หลังจากรู้ doc id
  await docRef.update({ id: docRef.id });

  console.log(
    `✅ สร้าง classroom เรียบร้อยแล้ว: ${classroomName} | id: ${docRef.id}`
  );
}

// เรียกใช้งาน
createClassroom({
  classroomName: "ใส่ชื่อห้อง ที่นี่",
  grade: "3",
  title: "ใส่ชื่อ ที่นี่",
  teacherId: "ใส่ teacherId ที่นี่",
  licenseId: "ใส่ licenseId ที่นี่",
  studentEmails: ["email 1", "email 2", "email 3"],
});
