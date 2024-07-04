import React from 'react'
import CreateNewStudent from '@/components/teacher/create-new-student';
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import  ClassroomData  from '@/lib/classroom-utils';


export default async function AddNewStudent(params: { params: { classroomId: string; }}) {
  const user = await getCurrentUser();
if (!user) {
  return redirect("/auth/signin");
}

const res = await ClassroomData({params: {classroomId: params.params.classroomId}});
const studentsMapped = res.studentsMapped;
const studentEmail = res.studentEmail;
const studentInEachClass = res.studentInEachClass;
const classrooms = res.classrooms;

  return (
    <>
  <CreateNewStudent studentDataInClass={studentsMapped} allStudentEmail={studentEmail} studentInEachClass={studentInEachClass} classrooms={classrooms}/>
    </>
  )
}
