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
  if (user.role !== "STUDENT") {
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
  return (
    <div>
       <NextAuthSessionProvider session={user}>
      <MyClasses 
      userId={user.id}
      classrooms={ resClassroom.data} 
      />
       </NextAuthSessionProvider>
    </div>
  )
}