import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import admin from "firebase-admin";
import { getAllLicenses } from "./license-controller";
import { getCurrentUser } from "@/lib/session";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);

interface RequestContext {
  params: {
    classroomId: string;
  };
}

interface License {
  id: string;
  school_name?: string;
}

interface User {
  xp?: number;
}

interface SchoolXP {
  school: string;
  xp: number;
}

interface Student {
  studentId?: string;
  email?: string;
  lastActivity?: string;
  profile?: {
    emailAddress?: string;
  };
}

interface Course {
  teacherId?: string | string[];
  userId?: string;
  classCode?: string;
  enrollmentCode?: string;
  classroomName?: string;
  name?: string;
  grade?: string;
  classroom?: {
    student?: Student[];
  };
  title?: string;
  creationTime?: string;
  alternateLink?: string;
  studentCount?: Student[];
  id?: string;
}

interface Classroom {
  teacherId: string | string[];
  archived: boolean;
  classCode: string;
  classroomName: string;
  grade: string;
  student: Student[];
  title: string;
  createdAt: Date;
  importedFromGoogle: boolean;
  alternateLink: string;
  license_id: string;
  googleClassroomId?: string;
}

// get all classrooms
// for get all -> GET /api/classroom
// for get all students -> GET /api/classroom/students
// for get by teacher -> GET /api/classroom?teacherId=abc123

export async function getAllStudentList(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();
    const licenseId = user?.license_id;

    const studentRef = await db
      .collection("users")
      .where("role", "==", "student")
      .where("license_id", "==", licenseId)
      .get();
    const studentData = studentRef.docs.map((doc) => doc.data());

    return NextResponse.json({ students: studentData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student list:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function getClassroom(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();

    const [stringQuery, arrayQuery] = await Promise.all([
      db
        .collection("classroom")
        .where("teacherId", "==", user?.id)
        .get(),
      db
        .collection("classroom")
        .where("teacherId", "array-contains", user?.id)
        .get()
    ]);

    const allDocs = [...stringQuery.docs, ...arrayQuery.docs];
    const uniqueDocs = allDocs.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );

    const docData = uniqueDocs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

    return NextResponse.json(
      {
        message: "success",
        data: docData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function getStudentClassroom(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();

    const docRef = await db
      .collection("classroom")
      .where("license_id", "==", user?.license_id)
      .get();

    const docData = docRef.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter classrooms where the current user is a student
    const studentClassrooms = docData.filter((classroom: any) => {
      return classroom.student?.some(
        (student: Student) =>
          student.studentId === user?.id || student.email === user?.email
      );
    });

    // Return only the classroom IDs
    const classroomId =
      studentClassrooms.length > 0 ? studentClassrooms[0].id : null;

    return NextResponse.json(
      {
        message: "success",
        data: classroomId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// get all classrooms students
export async function getClassroomStudent(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();

    const studentRef = await db.collection("users").get();
    const studentData = studentRef.docs.map((doc) => doc.data());

    const [stringQuery, arrayQuery] = await Promise.all([
      db
        .collection("classroom")
        .where("teacherId", "==", user?.id)
        .get(),
      db
        .collection("classroom")
        .where("teacherId", "array-contains", user?.id)
        .get()
    ]);

    const allDocs = [...stringQuery.docs, ...arrayQuery.docs];
    const uniqueDocs = allDocs.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );

    const classroomData = uniqueDocs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

    const filteredStudents = (users: any[], classroom: any[]) => {
      const studentIdentifiers = new Set<string>();

      classroom.forEach((classroom) => {
        classroom.student.forEach((student: any) => {
          if (student.studentId) studentIdentifiers.add(student.studentId);
          if (student.email) studentIdentifiers.add(student.email);
        });
      });

      return users.filter(
        (student) =>
          studentIdentifiers.has(student.id) ||
          studentIdentifiers.has(student.email)
      );
    };

    const filteredStudent = filteredStudents(studentData, classroomData);

    return NextResponse.json({ students: filteredStudent }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// get enroll classroom
export async function getEnrollClassroom(req: ExtendedNextRequest) {
  try {
    const params = req.nextUrl.searchParams.get("studentId");
    const user = await getCurrentUser();

    if (!params) {
      return NextResponse.json(
        { messages: "Invalid user ID" },
        { status: 501 }
      );
    }

    const studentRef = await db.collection("users").doc(params).get();
    const studentData = studentRef.data();

    if (studentData && studentData.last_activity) {
      studentData.last_activity = new Date(
        studentData.last_activity._seconds * 1000
      );
    }

    const [stringQuery, arrayQuery] = await Promise.all([
      db
        .collection("classroom")
        .where("teacherId", "==", user?.id)
        .get(),
      db
        .collection("classroom")
        .where("teacherId", "array-contains", user?.id)
        .get()
    ]);

    const allDocs = [...stringQuery.docs, ...arrayQuery.docs];
    const uniqueDocs = allDocs.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );

    const classrooms: FirebaseFirestore.DocumentData[] = [];

    uniqueDocs.forEach((doc) => {
      const classroom = doc.data();
      classroom.id = doc.id;
      classrooms.push(classroom);
    });

    const filteredClassrooms = classrooms.filter(
      (classroom) =>
        classroom.importedFromGoogle !== true &&
        classroom.student.every(
          (student: { studentId: string }) => student.studentId !== params
        )
    );

    return NextResponse.json(
      { student: studentData, classroom: filteredClassrooms },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

// get unenroll classroom
export async function getUnenrollClassroom(req: ExtendedNextRequest) {
  try {
    const params = req.nextUrl.searchParams.get("studentId");
    const user = await getCurrentUser();

    if (!params) {
      return NextResponse.json(
        { messages: "Invalid user ID" },
        { status: 501 }
      );
    }

    const studentRef = await db.collection("users").doc(params).get();
    const studentData = studentRef.data();

    if (studentData && studentData.last_activity) {
      studentData.last_activity = new Date(
        studentData.last_activity._seconds * 1000
      );
    }

    const [stringQuery, arrayQuery] = await Promise.all([
      db
        .collection("classroom")
        .where("teacherId", "==", user?.id)
        .get(),
      db
        .collection("classroom")
        .where("teacherId", "array-contains", user?.id)
        .get()
    ]);

    const allDocs = [...stringQuery.docs, ...arrayQuery.docs];
    const uniqueDocs = allDocs.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );

    const classrooms: FirebaseFirestore.DocumentData[] = [];

    uniqueDocs.forEach((doc) => {
      const classroom = doc.data();
      classroom.id = doc.id;
      classrooms.push(classroom);
    });

    const filteredClassrooms = classrooms.filter(
      (classroom) =>
        classroom.importedFromGoogle !== true &&
        classroom.student.some(
          (student: { studentId: string }) => student.studentId === params
        )
    );

    return NextResponse.json(
      { student: studentData, classroom: filteredClassrooms },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function getStudentInClassroom(
  req: ExtendedNextRequest,
  { params }: { params: { classroomId: string } }
) {
  try {
    const { classroomId } = params;
    let studentQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection("users");

    const studentsSnapshot = await studentQuery.get();
    const students = studentsSnapshot.docs.map((doc) => doc.data());

    const classroomRef = await db
      .collection("classroom")
      .doc(classroomId)
      .get();
    const classroomDoc = classroomRef.data();

    const filteredUsers = students
      .filter((user) =>
        classroomDoc?.student.some(
          (student: { email: string; studentId: string }) =>
            student.studentId === user.id || student.email === user.email
        )
      )
      .map((user) => ({
        ...user,
        last_activity: user.last_activity
          ? new Date(user.last_activity._seconds * 1000)
          : null,
      }));

    return NextResponse.json(
      { studentInClass: filteredUsers, classroom: classroomDoc },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// update student classroom
export async function updateStudentClassroom(req: ExtendedNextRequest) {
  try {
    const json = await req.json();
    const name = json.name;
    const studentId = json.studentId;

    await db.collection("users").doc(studentId).update({
      display_name: name,
    });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("error", error);

    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// get all classrooms teachers
export async function getClassroomTeacher(req: ExtendedNextRequest) {
  try {
    const userRef = db.collection("users").where("role", "==", "teacher");
    const snapshot = await userRef.get();
    const teachers = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json({ teachers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// create classroom
export async function createdClassroom(req: ExtendedNextRequest) {
  try {
    const user = await getCurrentUser();
    const json: { classroom?: Course; courses?: Course[] } = await req.json();
    const isImportedFromGoogle: boolean = Array.isArray(json.courses);
    const courses: Course[] = isImportedFromGoogle
      ? json.courses!
      : [json.classroom!];

    const classrooms: Classroom[] = courses
      .filter((course): course is Course => !!course)
      .map((data) => ({
        teacherId: user?.id || "",
        archived: false,
        classCode: data.classCode || data.enrollmentCode || "",
        classroomName: data.classroomName || data.name || "",
        grade: data.grade || "",
        student: isImportedFromGoogle
          ? (data.studentCount ?? []).map((student) => ({
              email: student.profile?.emailAddress || "",
              lastActivity: student.lastActivity || "No activity",
            }))
          : (data.classroom?.student ?? []).map((student) => ({
              studentId: student.studentId,
              lastActivity: student.lastActivity,
            })),
        title: data.title || "",
        createdAt: data.creationTime ? new Date(data.creationTime) : new Date(),
        importedFromGoogle: isImportedFromGoogle,
        alternateLink: data.alternateLink || "",
        license_id: user?.license_id || "",
        ...(isImportedFromGoogle && {
          googleClassroomId: data.id,
        }),
      }));

    // Save all classrooms to Firestore
    const batch = db.batch();
    const classroomCollection = db.collection("classroom");

    classrooms.forEach((classroom) => {
      const docRef = classroomCollection.doc();
      batch.set(docRef, classroom);
    });

    await batch.commit();

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// achive classroom
export async function achivedClassroom(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const { archived } = await req.json();

    // Fetch the classroom from the database
    const docRef = db.collection("classroom").doc(classroomId);
    const doc = await docRef.get();

    // Check if the classroom exists and the id matches
    if (!doc.exists || doc.id !== classroomId) {
      return NextResponse.json(
        { message: "Classroom not found or id does not match" },
        { status: 404 }
      );
    }

    // Update the classroom
    await docRef.update({ archived });

    return NextResponse.json(
      { message: "success updated archived status" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// update classroom
export async function updateClassroom(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const { classroomName, grade } = await req.json();

    // Fetch the classroom from the database
    const docRef = db.collection("classroom").doc(classroomId);
    const doc = await docRef.get();

    // Check if the classroom exists and the id matches
    if (!doc.exists || doc.id !== classroomId) {
      return NextResponse.json(
        { message: "Classroom not found or id does not match" },
        { status: 404 }
      );
    }

    // Update the classroom
    await docRef.update({ classroomName, grade });

    return NextResponse.json({ message: "success updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// delete classroom
export async function deleteClassroom(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const docRef = db.collection("classroom").doc(classroomId);
    const doc = await docRef.get();

    // Check if the classroom exists and the id matches
    if (!doc.exists || doc.id !== classroomId) {
      return NextResponse.json(
        { message: "Classroom not found or id does not match" },
        { status: 404 }
      );
    }

    // Delete the classroom
    await docRef.delete();

    return NextResponse.json({ message: "success deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// patch classroom enroll
export async function patchClassroomEnroll(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  const studentSchema = z.object({
    studentId: z.string(),
    lastActivity: z.string(),
  });

  try {
    const json = await req.json();
    const newStudent = z.array(studentSchema).parse(json.student);

    // const enrollmentClassroom = {
    //     student: json.student,
    //     // lastActivity: json.lastActivity,
    // };
    // Fetch the classroom from the database
    const docRef = db.collection("classroom").doc(classroomId);
    const doc = await docRef.get();

    // Check if the classroom exists and the id matches
    if (!doc.exists || doc.id !== classroomId) {
      return new Response(
        JSON.stringify({
          message: "Classroom not found or id does not match",
        }),
        { status: 404 }
      );
    }

    const currentStudents = doc.data()?.student || [];
    const updatedStudents = mergeStudents(currentStudents, newStudent);
    // Update the classroom
    // await docRef.update(enrollmentClassroom);

    await docRef.update({ student: updatedStudents });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }

  function mergeStudents(
    currentStudents: any[],
    newStudents: z.infer<typeof studentSchema>[]
  ) {
    const studentMap = new Map(
      currentStudents.map((student) => [student.studentId, student])
    );

    newStudents.forEach((newStudent) => {
      if (studentMap.has(newStudent.studentId)) {
        // Update lastActivity if the student already exists
        studentMap.get(newStudent.studentId)!.lastActivity =
          newStudent.lastActivity;
      } else {
        // Add new student if they don't exist
        studentMap.set(newStudent.studentId, newStudent);
      }
    });

    return Array.from(studentMap.values());
  }
}

// patch classroom unenroll
export async function patchClassroomUnenroll(
  req: ExtendedNextRequest,
  { params: { classroomId } }: RequestContext
) {
  try {
    const json = await req.json();

    const unenrollmentClassroom = json.student;

    // Fetch the classroom from the database
    const docRef = db.collection("classroom").doc(classroomId);
    const doc = await docRef.get();

    // Check if the classroom exists and the id matches
    if (!doc.exists || doc.id !== classroomId) {
      return NextResponse.json(
        { message: "Classroom not found or id does not match" },
        { status: 404 }
      );
    }

    // Update the classroom
    await docRef.update({
      student: unenrollmentClassroom,
    });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

//update xp for classroom
export async function calculateClassXp(
  req: NextRequest,
  ctx: RequestContext = { params: { classroomId: "" } }
) {
  try {
    const firestore = admin.firestore();
    //console.log("Fetching licenses...");

    const licensesSnapshot = await firestore.collection("licenses").get();
    const licenses = licensesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (licenses.length === 0) {
      console.error("No licenses found.");
      return NextResponse.json(
        { message: "No licenses found" },
        { status: 404 }
      );
    }

    //console.log(`Found ${licenses.length} licenses.`);

    const now = new Date();
    const currentYear = now.getFullYear(); // ปีปัจจุบัน เช่น 2025
    const startOfYear = new Date(currentYear, 0, 1).getTime();
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).getTime();

    for (const license of licenses) {
      const licenseId = license.id;
      //console.log(`Processing license: ${licenseId}`, license);

      if (!licenseId) {
        console.warn("License ID is missing, skipping...");
        continue;
      }

      if (
        !licenseId ||
        typeof licenseId !== "string" ||
        licenseId.trim() === ""
      ) {
        console.error("Invalid licenseId:", licenseId);
        continue;
      }

      const classroomSnapshot = await firestore
        .collection("classroom")
        .where("license_id", "==", licenseId)
        .get();
      //console.log(
      //`Found ${classroomSnapshot.size} classrooms for license ${licenseId}`
      //);

      let classXpData: {
        name: string;
        xp: { week: number; month: number; year: number };
      }[] = [];

      for (const docSnap of classroomSnapshot.docs) {
        const classroomData = docSnap.data();
        const classroomName = classroomData.classroomName;
        //console.log(`Processing classroom: ${classroomName}`);

        const studentIds: string[] = (classroomData.student || []).map(
          (student: any) => student.studentId
        );

        if (studentIds.length === 0) continue;

        const userActivityLogs: any[] = [];

        for (const studentId of studentIds) {
          //console.log(`Fetching activity for student: ${studentId}`);

          if (
            !studentId ||
            typeof studentId !== "string" ||
            studentId.trim() === ""
          ) {
            console.warn(`Skipping invalid student ID: ${studentId}`);
            continue;
          }

          const studentRef = firestore
            .collection("user-activity-log")
            .doc(studentId);

          const subCollections = await studentRef.listCollections();

          for (const subCollection of subCollections) {
            //console.log(
            //`Fetching activities from subcollection: ${subCollection.id}`
            //);

            const subCollectionSnapshot = await subCollection.get();

            subCollectionSnapshot.forEach((doc) => {
              const data = doc.data();
              if (
                data.timestamp &&
                data.userId &&
                data.activityStatus === "completed" &&
                data.activityType !== "level_test"
              ) {
                userActivityLogs.push({
                  ...data,
                  timestamp: data.timestamp?.toDate(),
                });
              }
            });
          }
        }

        //console.log(
        //  `Found ${userActivityLogs.length} activities for classroom ${classroomName}`
        //);

        let xpByPeriod = { week: 0, month: 0, year: 0 };

        userActivityLogs.forEach((data) => {
          const xpEarned = data.xpEarned || 0;
          const activityDate = new Date(data.timestamp).getTime();

          if (activityDate >= startOfYear && activityDate <= endOfYear) {
            const diffTime = now.getTime() - activityDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays <= 7) xpByPeriod.week += xpEarned;
            if (diffDays <= 30) xpByPeriod.month += xpEarned;
            xpByPeriod.year += xpEarned;
          }
        });

        //console.log(
        //`Calculated XP for classroom ${classroomName}:`,
        //xpByPeriod
        //);
        classXpData.push({ name: classroomName, xp: xpByPeriod });
      }

      const sortedClasses = classXpData.sort((a, b) => b.xp.year - a.xp.year);

      const dataMostActive = {
        week: sortedClasses
          .slice(0, 5)
          .map((cls) => ({ name: cls.name, xp: cls.xp.week })),
        month: sortedClasses
          .slice(0, 5)
          .map((cls) => ({ name: cls.name, xp: cls.xp.month })),
        year: sortedClasses
          .slice(0, 5)
          .map((cls) => ({ name: cls.name, xp: cls.xp.year })),
      };

      const dataLeastActive = {
        week: sortedClasses
          .slice(-5)
          .map((cls) => ({ name: cls.name, xp: cls.xp.week })),
        month: sortedClasses
          .slice(-5)
          .map((cls) => ({ name: cls.name, xp: cls.xp.month })),
        year: sortedClasses
          .slice(-5)
          .map((cls) => ({ name: cls.name, xp: cls.xp.year })),
      };

      //console.log(`Saving XP log for license ${licenseId} in year ${currentYear}`);

      const classXpLogRef = firestore
        .collection("class-xp-log")
        .doc(`${currentYear}`)
        .collection("licenses")
        .doc(licenseId);

      await classXpLogRef.set({
        dataMostActive,
        dataLeastActive,
        createdAt: new Date(),
      });

      //console.log(`Saved XP log for license ${licenseId} in year ${currentYear}`);
    }

    return NextResponse.json(
      { message: `Data stored successfully for year ${currentYear}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching class XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// get Class Xp
export async function getClassXp(req: NextRequest) {
  const firestore = admin.firestore();
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const licenseId = searchParams.get("licenseId");

    if (!year) {
      return NextResponse.json(
        { message: "Year parameter is required" },
        { status: 400 }
      );
    }

    //console.log(`Fetching class XP data for year: ${year}`);

    const yearRef = firestore.collection("class-xp-log").doc(year);
    const licensesCollectionRef = yearRef.collection("licenses");

    if (licenseId) {
      //console.log(`Fetching data for license: ${licenseId}`);
      const licenseDoc = await licensesCollectionRef.doc(licenseId).get();

      if (!licenseDoc.exists) {
        return NextResponse.json(
          { message: `No data found for license ${licenseId} in ${year}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        year,
        licenseId,
        data: licenseDoc.data(),
      });
    }

    //console.log(`Fetching all license data for year ${year}`);
    const licensesSnapshot = await licensesCollectionRef.get();

    if (licensesSnapshot.empty) {
      return NextResponse.json(
        { message: `No XP data found for year ${year}` },
        { status: 404 }
      );
    }

    const licensesData: Record<string, any> = {};
    licensesSnapshot.forEach((doc) => {
      licensesData[doc.id] = doc.data();
    });

    return NextResponse.json({
      year,
      licenses: licensesData,
    });
  } catch (error) {
    console.error("Error fetching XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function calculateSchoolsXp(
  req: NextRequest
): Promise<NextResponse> {
  try {
    //console.log("Starting calculateLicenseXp API");

    const summaryCollection = db.collection("license-xp-summary");
    const summarySnapshot = await summaryCollection.get();
    const batch = db.batch();

    //console.log(`Found ${summarySnapshot.size} documents in license-xp-summary, deleting...`);
    summarySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    //console.log("Cleared license-xp-summary collection");

    const licensesSnapshot = await db.collection("licenses").get();
    //console.log(`Found ${licensesSnapshot.size} licenses`);

    const licenses: License[] = licensesSnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() } as License;
    });

    if (licenses.length === 0) {
      console.error("No licenses found.");
      return NextResponse.json(
        { message: "No licenses found" },
        { status: 404 }
      );
    }

    for (const license of licenses) {
      const licenseId: string = license.id;
      const schoolName: string = license.school_name || "Unknown School";

      //console.log(`Processing license: ${licenseId}, School: ${schoolName}`);

      if (!licenseId) {
        console.warn("License ID is missing, skipping...");
        continue;
      }

      const usersSnapshot = await db
        .collection("users")
        .where("license_id", "==", licenseId)
        .get();

      //console.log(`Found ${usersSnapshot.size} users for license ${licenseId}`);

      const users: User[] = usersSnapshot.docs.map((doc) => doc.data() as User);

      const totalXp: number = users.reduce((sum, user) => {
        const userXp: number = user.xp || 0;
        //console.log(`User XP: ${userXp}`);
        return sum + userXp;
      }, 0);

      //console.log(`Total XP for license ${licenseId}: ${totalXp}`);

      await summaryCollection.doc(licenseId).set({
        school: schoolName,
        xp: totalXp,
        updatedAt: new Date(),
      });

      //console.log(`Saved XP summary for license ${licenseId}`);
    }

    //console.log("Finished processing all licenses.");
    return NextResponse.json(
      { message: "XP data stored successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching license XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getTopSchoolsXp(req: NextRequest): Promise<NextResponse> {
  try {
    //console.log("Fetching top schools by XP");
    const summaryCollection = db.collection("license-xp-summary");
    const summarySnapshot = await summaryCollection
      .orderBy("xp", "desc")
      .limit(10)
      .get();

    const topSchools: SchoolXP[] = summarySnapshot.docs.map((doc) => ({
      school: doc.data().school,
      xp: doc.data().xp,
    }));

    return NextResponse.json({ data: topSchools }, { status: 200 });
  } catch (error) {
    console.error("Error fetching top schools XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function processAllLicensesXP() {
  try {
    const licensesSnap = await db.collection("licenses").get();

    const studentToLicense = new Map<
      string,
      { licenseId: string; classroomId: string }
    >();
    const licenseData = new Map<
      string,
      Map<
        string,
        Map<
          string,
          { today: number; week: number; month: number; allTime: number }
        >
      >
    >();

    // 1. Loop licenses → classrooms → students
    for (const licenseDoc of licensesSnap.docs) {
      const licenseId = licenseDoc.id;
      const classSnap = await db
        .collection("classroom")
        .where("license_id", "==", licenseId)
        .get();

      const licenseMap = new Map();
      for (const classDoc of classSnap.docs) {
        const classData = classDoc.data();
        const classroomId = classDoc.id;
        const students = classData.student || [];

        const studentMap = new Map();
        for (const s of students) {
          const studentId = s.studentId;
          studentToLicense.set(studentId, { licenseId, classroomId });
          studentMap.set(studentId, {
            today: 0,
            week: 0,
            month: 0,
            allTime: 0,
          });
        }
        licenseMap.set(classroomId, studentMap);
      }
      licenseData.set(licenseId, licenseMap);
    }

    // 2. Prepare dates
    const today = dayjs().startOf("day");
    const weekStart = dayjs().startOf("isoWeek");
    const monthStart = dayjs().startOf("month");

    // 3. Scan activity logs
    const activitySnap = await db.collection("user-activity-log").get();

    for (const activityDoc of activitySnap.docs) {
      const subcollections = await activityDoc.ref.listCollections();

      for (const sub of subcollections) {
        if (sub.id === "level-test-activity-log") continue;

        const subSnap = await sub.get();
        for (const doc of subSnap.docs) {
          const data = doc.data();
          const userId = data.userId;
          const xp = data.xpEarned || 0;
          const ts = data.timestamp?.toDate?.();
          if (!ts || !studentToLicense.has(userId)) continue;

          const { licenseId, classroomId } = studentToLicense.get(userId)!;
          const classMap = licenseData.get(licenseId);
          const studentMap = classMap?.get(classroomId);
          const entry = studentMap?.get(userId);
          if (!entry) continue;

          const date = dayjs(ts);
          entry.allTime += xp;
          if (date.isSameOrAfter(monthStart)) entry.month += xp;
          if (date.isSameOrAfter(weekStart)) entry.week += xp;
          if (date.isSameOrAfter(today)) entry.today += xp;
        }
      }
    }

    // 4. Save summary to Firestore
    for (const [licenseId, classMap] of licenseData) {
      const payload: Record<string, any> = {};
      for (const [classroomId, studentMap] of classMap) {
        payload[classroomId] = {};
        for (const [studentId, xp] of studentMap) {
          payload[classroomId][studentId] = xp;
        }
      }
      await db.collection("xp-summary").doc(licenseId).set(payload);
    }

    return NextResponse.json({ message: "XP summary processed" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getClassXpPerStudents(
  req: NextRequest,
  ctx: RequestContext
) {
  try {
    const classroomId = ctx.params?.classroomId;
    if (!classroomId) {
      return NextResponse.json(
        { message: "Missing classroomId" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "today", "week", "month", "allTime"

    const classroomRef = await db
      .collection("classroom")
      .doc(classroomId)
      .get();
    const classroomDoc = classroomRef.data();

    const license_id = classroomDoc?.license_id;
    if (!license_id) {
      return NextResponse.json(
        { message: "Classroom not found or license_id is missing" },
        { status: 404 }
      );
    }

    const studentsXpSnapshot = await db
      .collection("xp-summary")
      .doc(license_id)
      .get();

    const studentsXpData = studentsXpSnapshot.data();
    if (!studentsXpData) {
      return NextResponse.json(
        { message: "XP data not found" },
        { status: 404 }
      );
    }

    const classroomXpData = studentsXpData[classroomId];
    if (!classroomXpData) {
      return NextResponse.json(
        { message: "XP data for classroom not found" },
        { status: 404 }
      );
    }

    const result: Record<string, number> = {};

    // Loop เพื่อดึง display_name ทีละคน
    for (const [studentId, xpData] of Object.entries(classroomXpData)) {
      // ดึง display_name จาก users/{studentId}
      const userSnapshot = await db.collection("users").doc(studentId).get();
      const userData = userSnapshot.data();
      const displayName = userData?.display_name || studentId;

      // filter ค่า XP ที่ต้องการ
      if (filter) {
        const xpValue = (xpData as any)[filter] ?? 0;
        result[displayName] = xpValue;
      } else {
        // ถ้าไม่ filter ก็เก็บทั้ง object
        result[displayName] = xpData as number;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
