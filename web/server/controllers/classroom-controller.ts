import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import exp from "constants";
import { last } from "lodash";
import admin from "firebase-admin";
import { getAllLicenses } from "./license-controller";

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

// get all classrooms
// for get all -> GET /api/classroom
// for get by teacher -> GET /api/classroom?teacherId=abc123
export async function getClassroom(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection("classroom");

    if (teacherId) {
      query = query.where("teacherId", "==", teacherId);
    }

    const classroomsSnapshot = await query.get();
    const classrooms: FirebaseFirestore.DocumentData[] = [];

    classroomsSnapshot.forEach((doc) => {
      const classroom = doc.data();
      classroom.id = doc.id;
      classrooms.push(classroom);
    });

    classrooms.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(
      {
        message: "success",
        data: classrooms,
      },
      { status: 200 }
    );
  } catch (error) {
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
    const userRef = db.collection("users").where("role", "==", "student");
    const snapshot = await userRef.get();
    const students = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
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
    const json = await req.json();
    const body = json.classroom;
    const classroom = {
      teacherId: body.teacherId,
      archived: false,
      classCode: body.classCode,
      classroomName: body.classroomName,
      grade: body.grade,
      student: body.student.map((student: any) => {
        return {
          studentId: student.studentId,
          lastActivity: student.lastActivity,
        };
      }),
      title: body.title,
      createdAt: new Date(),
    };

    await db.collection("classroom").add(classroom);

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 200 }
    );
  } catch (error) {
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
    //con-sole.log("Fetching licenses...");

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
              userActivityLogs.push({
                ...data,
                timestamp: data.timestamp?.toDate(),
              });
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
