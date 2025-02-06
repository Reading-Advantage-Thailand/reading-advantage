import ClassRoster from "@/components/teacher/class-roster";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RosterPage({
  params,
}: {
  params: { classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const ClassesData = async () => {
    const resClass = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom`,
      { method: "GET", headers: headers() }
    );
    if (!resClass.ok) throw new Error("Failed to fetch ClassesData list");
    const ClassroomData = await resClass.json();

    const allClassrooms =
      user.role === "system"
        ? ClassroomData.data
        : ClassroomData.data.filter(
            (classroom: { teacherId: string }) =>
              classroom.teacherId === user.id
          );

    const classData = allClassrooms.filter(
      (classroom: { id: string }) => classroom.id === params.classroomId
    );

    const resStudent = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom/students`,
      { method: "GET", headers: headers() }
    );
    if (!resStudent.ok) throw new Error("Failed to fetch StudentData list");
    const studentsData = await resStudent.json();

    const StudentId: string[] = classData.flatMap((classroom: any) =>
      classroom.student.map((student: any) => student.studentId)
    );

    const studentInClass = studentsData.students.filter(
      (entry: { id: string }) => StudentId.includes(entry.id)
    );

    const classes = allClassrooms.map((classroom: any) => ({
      id: classroom.id,
      classroomName: classroom.classroomName,
    }));

    return {
      classData,
      studentInClass,
      classes,
    };
  };

  const data = await ClassesData();

  return (
    <div>
      <ClassRoster
        studentInClass={data.studentInClass}
        classrooms={data.classData}
        classes={data.classes}
      />
    </div>
  );
}
