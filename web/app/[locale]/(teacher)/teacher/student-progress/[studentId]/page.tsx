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
import React from "react";
import ResetDialog from "@/components/reset-xp-dialog";

async function getStudentProgress(studentId: string) {
    const res = await fetch (
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/students/${studentId}/progress-article-record`,
        {
        method: "GET",
        headers: headers(),
        }
    );
    
    return res.json();
    }

export default async function ProgressPage({params}: {params: {studentId: string}}) {
  const user = await getCurrentUser();
  const resStudentProgress = await getStudentProgress(params.studentId);
  const userId = user?.id ?? '';  
  let nameOfStudent = '';
  let studentLevel: number = 0;

  if (userId === resStudentProgress.articles[0]?.userId) {
    nameOfStudent = user?.name?? 'Unknown';
    studentLevel = user?.level ?? 0;
  }

  return (
    <>
{resStudentProgress.articles[0]?.userId ? (
  <div>
<Header heading={`Progress of ${nameOfStudent}`} />
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4 mb-10">
    <Card className="md:col-span-4">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <UserActivityChart data={resStudentProgress.articles} />
      </CardContent>
    </Card>
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Level</CardTitle>
        <CardDescription>
          Your current level is {studentLevel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserLevelChart
          data={resStudentProgress.articles}
          resGeneralDescription={resStudentProgress}
        />
      </CardContent>
    </Card>
  </div>
  {/* <ResetDialog /> */}
  </div>
) : (
  <p className="text-center">No user progress available.</p>
)}
    </>
  );
}


