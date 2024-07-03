import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import Reports from "@/components/teacher/reports";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import  ClassroomData  from "@/lib/classroom-utils";

export default async function ReportsPage(params: {
  params: { classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === "TEACHER") {
    return redirect("/teacher/my-classes");
  }

  const res = await ClassroomData({ params: { classroomId: params.params.classroomId } });
  const studentsMapped = res.studentsMapped;

  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <Reports studentInClass={studentsMapped} userId={user.id} />
      </NextAuthSessionProvider>
    </div>
  );
}
