import MyStudents from "@/components/teacher/my-students";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { headers } from "next/headers";

type Student = {
  studentId: string;
  lastActivity: string;
};

type Classroom = {
  teacherId: string;
  classroomName: string;
  student: Student[];
};

export default async function MyStudentPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const StudentData = async () => {
    const resStudent = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom/students`,
      { method: "GET", headers: headers() }
    );
    if (!resStudent.ok) throw new Error("Failed to fetch StudentData list");
    const studentsData = await resStudent.json();

    const resClassroom = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom`,
      { method: "GET", headers: headers() }
    );
    if (!resClassroom.ok) throw new Error("Failed to fetch ClassesData list");
    const classroomData = await resClassroom.json();

    const classData: string[] = classroomData.data.flatMap(
      (classroom: Classroom) =>
        classroom.student.map((student: Student) => student.studentId)
    );

    if (user.role === "system") {
      return studentsData.students;
    }
    return studentsData.students.filter((entry: { id: string }) =>
      classData.includes(entry.id)
    );
  };

  const data = await StudentData();

  return (
    <div>
      <MyStudents matchedStudents={data} />
    </div>
  );
}
