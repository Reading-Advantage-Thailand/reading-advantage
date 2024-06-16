import MyStudents from '@/components/teacher/my-students'
import { getCurrentUser } from '@/lib/session';
import { redirect } from "next/navigation";
import React from 'react'
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import { ClassesData } from '@/lib/classroom-utils';

export default async function MyStudentPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === "TEACHER") {
    return redirect("/teacher/my-classes");
  }

    const res = await ClassesData();  
    const matchedStudents = res.matchedStudents;
    
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
