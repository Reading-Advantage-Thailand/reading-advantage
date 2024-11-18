import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import MyEnrollClasses from "@/components/teacher/enroll-classes";
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

export default async function EnrollPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const ClassesData = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom`,
      { method: "GET", headers: headers() }
    );
    if (!res.ok) throw new Error("Failed to fetch ClassesData list");
    const fetchdata = await res.json();

    if (user.role === "system") {
      return fetchdata.data.filter((classroom: Classroom) =>
        classroom.student.some(
          (student: Student) => student.studentId === params.studentId
        )
      );
    } else {
      const classData = fetchdata.data.filter(
        (classroom: { teacherId: string }) => classroom.teacherId === user.id
      );

      const filterStudentData = classData.filter((classroom: Classroom) =>
        classroom.student.every(
          (student: Student) => student.studentId !== params.studentId
        )
      );
      return filterStudentData;
    }
  };

  const StudentsData = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${params.studentId}`,
      { method: "GET", headers: headers() }
    );
    if (!res.ok) throw new Error("Failed to fetch StudentData list");
    const fetchdata = await res.json();
    return fetchdata.data;
  };

  const data = await ClassesData();
  const studentData = await StudentsData();

  return (
    <div>
      <MyEnrollClasses enrolledClasses={data} studentData={studentData} />
    </div>
  );
}
