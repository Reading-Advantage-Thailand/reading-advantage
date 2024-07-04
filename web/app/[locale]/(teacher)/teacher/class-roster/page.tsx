import ClassRoster from "@/components/teacher/class-roster";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import  ClassroomData, {ClassesData } from '@/lib/classroom-utils';

export default async function RosterPage(params: {
  params: {classroomId: string;}
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.role === "TEACHER") {
    return redirect("/teacher/my-classes");
  }

  const res = await ClassroomData({params: {classroomId: params.params.classroomId}});
  const studentsMapped = res.studentsMapped;
  const classrooms = res.classrooms;

  const classesRes = await ClassesData(); 
  const classes = classesRes.classes;

  return (
    <div>
      <ClassRoster studentInClass={studentsMapped} classrooms={classrooms} classes={classes}/>
    </div>
  );
}
