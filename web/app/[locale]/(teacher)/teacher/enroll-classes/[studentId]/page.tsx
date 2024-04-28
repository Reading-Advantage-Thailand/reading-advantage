import MyStudents from '@/components/teacher/my-students'
import { getCurrentUser } from '@/lib/session';
import { redirect } from "next/navigation";
import React from 'react'
import { headers } from "next/headers";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import MyEnrollClasses from '@/components/teacher/enroll-classes';
import { match } from 'assert';

export default async function EnrollPage({params}: {params: {studentId: string}}) {
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

        allStudent.students.forEach((student: { id: string; }) => {
          allClassroom.data.forEach((classroom: { student: any; archived: boolean; teacherId: string; }) => {
            if (!classroom.archived && classroom.teacherId === teacherId) {
              classroom.student.forEach((students: { studentId: string; }) => {
                if (students.studentId === studentId) {
                  if (!matchedClassrooms.includes(classroom)) {
                    matchedClassrooms.push(classroom);
                  }
                }
              });
            }
          });
        });
      return matchedClassrooms;
    }
    const matchedClassrooms = getMatchedClassrooms(params.studentId);


    // get teacher classroom
    function getTeacherClassroom() {
      let teacherClassrooms: any[] = [];
      const teacherId = (user as { id: string }).id;
      allClassroom.data.forEach((classroom: { teacherId: string; archived: boolean;}) => {
        if (!classroom.archived && classroom.teacherId === teacherId) {
          teacherClassrooms.push(classroom);
        }
      });
      return teacherClassrooms;
    }
    const teacherClassrooms = getTeacherClassroom();
    
    // student not enroll class
  function getDifferentItems(arrayA: any[], arrayB: any[]) {
      return arrayA.filter(item => !arrayB.includes(item))
                  .concat(arrayB.filter(item => !arrayA.includes(item)));
  } 
  const differentClasses = getDifferentItems(teacherClassrooms, matchedClassrooms);
  // console.log('differentItems: ', differentClasses);

   // get matched students
   function getMatchedStudents(studentId: string) {
    let matchedStudents: any[] = [];

    allStudent.students.forEach((student: { id: string; }) => {
      if (student.id === studentId) {
        matchedStudents.push(student);
      }
    });

  return matchedStudents;
}
const matchedStudents = getMatchedStudents(params.studentId);

    return (
      <div>
      <NextAuthSessionProvider session={user}>
     <MyEnrollClasses enrolledClasses={differentClasses} studentId={params.studentId} matchedStudents={matchedStudents} />
      </NextAuthSessionProvider>
   </div>
    )
}
