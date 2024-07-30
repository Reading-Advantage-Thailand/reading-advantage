import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import MyUnEnrollClasses from "@/components/teacher/unenroll-classes";
import { StudentsData } from "@/lib/classroom-utils";
import { Role } from "@/server/models/enum";

export default async function UnEnrollPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === Role.TEACHER) {
    return redirect("/teacher/my-classes");
  }

  const res = await StudentsData({ params: { studentId: params.studentId } });
  const matchedClassrooms = res.matchedClassrooms;
  const matchedNameOfStudents = res.matchedNameOfStudents;
  const updateStudentListBuilder = res.updateStudentListBuilder;

  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <MyUnEnrollClasses
          enrolledClasses={matchedClassrooms}
          matchedNameOfStudents={matchedNameOfStudents}
          updateStudentList={updateStudentListBuilder}
          studentId={params.studentId}
        />
      </NextAuthSessionProvider>
    </div>
  );
}
