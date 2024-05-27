import { UserActivityChart } from "@/components/dashboard/user-artivity-chart";
import { UserLevelChart } from "@/components/dashboard/user-level-chart";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";
import { headers } from "next/headers";
import React, { use } from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import { redirect } from "next/navigation";

// async function getStudentProgress(studentId: string) {
//     const res = await fetch (
//         `${process.env.NEXT_PUBLIC_BASE_URL}/api/students/${studentId}/progress-article-record`,
//         {
//         method: "GET",
//         headers: headers(),
//         }
//     );
    
//     return res.json();
//     }

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/records`);
}

async function getGeneralDescription(userLevel: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/master-data/level-mean/${userLevel}`,
    {
      method: "GET",
      headers: headers(),
    }
  );
  return res.json();
}

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

export default async function ProgressPage({params}: {params: {studentId: string}}) {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  const resStudentProgress = await getUserArticleRecords(params.studentId);
  const resGeneralDescription = await getGeneralDescription(user.level);
  const t = await getScopedI18n('pages.teacher.studentProgressPage');

  const allStudent = await getAllStudentData(); 
  
  let nameOfStudent = '';
  let studentLevel: number = 0;

  allStudent.students.forEach((student: { id: string; name: string; level: number; }) => {
    if (student.id === params.studentId) {
      nameOfStudent = student.name;
      studentLevel = student.level;
    }
  }
  );

  return (
    <>
{resStudentProgress.results ? (
  <div>
<Header heading={t('progressOf', {nameOfStudent: nameOfStudent})} />
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4 mb-10">
    <Card className="md:col-span-4">
      <CardHeader>
        <CardTitle>{t('activity')}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <UserActivityChart data={resStudentProgress.results} />
      </CardContent>
    </Card>
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>{t('level')}</CardTitle>
        <CardDescription>
          {t('levelDescription', {level: studentLevel})}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserLevelChart
          data={resStudentProgress.results}
          resGeneralDescription={resGeneralDescription}
        />
      </CardContent>
    </Card>
  </div>
  </div>
) : (
  <p className="text-center">{t('noUserProgress')}</p>
)}
    </>
  );
}


