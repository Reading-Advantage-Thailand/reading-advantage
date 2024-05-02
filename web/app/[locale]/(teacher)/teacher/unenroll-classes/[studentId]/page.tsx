import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { headers } from "next/headers";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import MyUnEnrollClasses from "@/components/teacher/unenroll-classes";
import { Console } from "console";

export default async function UnEnrollPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === "TEACHER") {
    return redirect("/teacher/my-classes");
  }

  // get student role data from database
  async function getAllStudentData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/classroom/students`,
        {
          method: "GET",
          headers: headers(),
        }
      );

      return res.json();
    } catch (error) {
      console.error("Failed to parse JSON", error);
    }
  }
  const allStudent = await getAllStudentData();

  // get classroom data from database
  async function getAllClassroom() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/classroom/`,
        {
          method: "GET",
          headers: headers(),
        }
      );

      return res.json();
    } catch (error) {
      console.error("Failed to parse JSON", error);
    }
  }
  const allClassroom = await getAllClassroom();

  // get matched classroom
  function getMatchedClassrooms(studentId: string) {
    let matchedClassrooms: any[] = [];
    const teacherId = (user as { id: string }).id;

    allStudent.students.forEach((student: { id: string }) => {
      allClassroom.data.forEach(
        (classroom: { student: any; archived: boolean; teacherId: string }) => {
          if (!classroom.archived && classroom.teacherId === teacherId) {
            if (classroom.student) {
              classroom.student.forEach((students: { studentId: string }) => {
                if (students.studentId === studentId) {
                  if (!matchedClassrooms.includes(classroom)) {
                    matchedClassrooms.push(classroom);
                  }
                }
              });
            } else {
              matchedClassrooms.push("No students found");
            }
          }
        }
      );
    });
    return matchedClassrooms;
  }
  const matchedClassrooms = getMatchedClassrooms(params.studentId);

  // get matched name of students to display on web
  function getMatchedNameOfStudents(studentId: string) {
    let matchedStudents: any[] = [];

    allStudent.students.forEach((student: { id: string }) => {
      if (student.id === studentId) {
        matchedStudents.push(student);
      }
    });

    return matchedStudents;
  }
  const matchedNameOfStudents = getMatchedNameOfStudents(params.studentId);

const studentIdInMatchedClassrooms = matchedClassrooms.flatMap(
    (classroom) => {
      if (classroom && classroom.student && classroom.student.length === 0) {
        console.log('This classroom has no student');
      } else {
         return classroom && classroom.student ? classroom.student.map((student: { studentId: string; }) => student.studentId) : [];
      }
    }
);
console.log('studentIdInMatchedClassrooms', studentIdInMatchedClassrooms);

  // get id of student in matched classrooms
 function getIdOfStudentInMatchedClassrooms(studentId: string) {
    let updateStudentIdInMatchedClassrooms: any[] = [];
    studentIdInMatchedClassrooms.forEach((id) => {
        if (id !== studentId) {
            updateStudentIdInMatchedClassrooms.push(id);
        }
    });
    return updateStudentIdInMatchedClassrooms;
  }
    const updateStudentIdInMatchedClassrooms = getIdOfStudentInMatchedClassrooms(params.studentId);

const updateStudentListBuilder = updateStudentIdInMatchedClassrooms.map(studentId => ({ studentId }));

  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <MyUnEnrollClasses
          enrolledClasses={matchedClassrooms}
          matchedNameOfStudents={matchedNameOfStudents}
          updateStudentList={updateStudentListBuilder}
        />
      </NextAuthSessionProvider>
    </div>
  );
}
