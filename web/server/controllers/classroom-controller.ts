import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import exp from "constants";
import { last } from "lodash";

interface RequestContext {
  params: {
    classroomId: string;
  };
}

// get all classrooms
export async function getClassroom(req: ExtendedNextRequest) {
  try {
    const classroomsSnapshot = await db.collection("classroom").get();
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
        message: error,
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
