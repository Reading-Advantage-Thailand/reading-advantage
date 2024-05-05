import React from 'react'
import MyClasses from '@/components/teacher/my-classes'
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";

export default async function myClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === "TEACHER") {
    return redirect("/teacher/my-classes");
  }

  // get data from database
  async function getClassroomData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/classroom`,
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
const resClassroom = await getClassroomData();

// get teacher data from database
async function getAllTeachersData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/classroom/teachers`,
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
const allTeachers = await getAllTeachersData();

// filter only teacher login
const teacherId = () => {
let teacherId: String[] = [];
allTeachers.teachers.forEach((teacher: { id: string; role: any}) => {
  if (teacher.role && teacher.role.includes('TEACHER') && teacher.id === user.id) {
    teacherId.push(teacher.id);
  }
});
return teacherId;
}
const teacher = teacherId();

const getClassroomOfThatTeacher = () => {
  let classrooms: any[] = [];
  resClassroom.data.forEach((classroom: { student: any; archived: boolean; teacherId: string; }) => {
     if (!classroom.archived && classroom.teacherId === teacher[0]) {
      classrooms.push(classroom);
    }
  });
  return classrooms;
 }
 const classes = getClassroomOfThatTeacher();
 

  return (
    <div>
       <NextAuthSessionProvider session={user}>
      <MyClasses 
      userId={user.id}
      userName={user.name}  
      classrooms={classes} 
      />
       </NextAuthSessionProvider>
    </div>
  )
}
