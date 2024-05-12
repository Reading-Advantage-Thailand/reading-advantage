import MyStudents from '@/components/teacher/my-students'
import { getCurrentUser } from '@/lib/session';
import { redirect } from "next/navigation";
import React from 'react'
import { headers } from "next/headers";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";

export default async function MyStudentPage() {
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
    
    // get matched students
    function getMatchedStudents() {
        let matchedStudents: any[] = [];
        const teacherId = (user as { id: string }).id;

        allStudent.students.forEach((student: { id: string; }) => {
          allClassroom.data.forEach((classroom: { student: any; archived: boolean; teacherId: string; }) => {
            if (!classroom.archived && classroom.teacherId === teacherId) {
              if (classroom.student) {
                classroom.student.forEach((students: { studentId: string; }) => {
                  if (students.studentId === student.id && !matchedStudents.includes(student)) {
                    matchedStudents.push(student);
                  }
                });
            }
          }
          });
        });
        
      return matchedStudents;
    }
    const matchedStudents = getMatchedStudents();
    
    return (
      <div>
      <NextAuthSessionProvider session={user}>
     <MyStudents 
            matchedStudents={matchedStudents}
            />
      </NextAuthSessionProvider>
   </div>
    )
}
