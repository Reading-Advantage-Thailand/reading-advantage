import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import MyEnrollClasses from "@/components/teacher/enroll-classes";
import { StudentsData } from "@/lib/classroom-utils";

export default async function EnrollPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const res = await StudentsData({ params: { studentId: params.studentId } });
  const matchedNameOfStudent = res.matchedNameOfStudents;
  const differentClasses = res.differentClasses;

  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <MyEnrollClasses
          enrolledClasses={differentClasses}
          studentId={params.studentId}
          matchedNameOfStudent={matchedNameOfStudent}

        />
      </NextAuthSessionProvider>
    </div>
  );
}
