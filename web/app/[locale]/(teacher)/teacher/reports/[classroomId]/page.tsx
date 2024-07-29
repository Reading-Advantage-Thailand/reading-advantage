import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import Reports from "@/components/teacher/reports";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ClassroomData from "@/lib/classroom-utils";
import { ClassesData } from "@/lib/classroom-utils";
import { Role } from "@/server/models/enum";

export default async function ReportsClassroomPage(params: {
  params: { classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === Role.TEACHER) {
    return redirect("/teacher/my-classes");
  }

  const res = await ClassroomData({
    params: { classroomId: params.params.classroomId },
  });
  const studentsMapped = res.studentsMapped;
  const classrooms = res.classrooms;

  const classesRes = await ClassesData();
  const classes = classesRes.classes;

  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <Reports
          studentInClass={studentsMapped}
          userId={user.id}
          classrooms={classrooms}
          classes={classes}
        />
      </NextAuthSessionProvider>
    </div>
  );
}
