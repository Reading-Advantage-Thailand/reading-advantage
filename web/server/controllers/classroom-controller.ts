import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import exp from "constants";

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
