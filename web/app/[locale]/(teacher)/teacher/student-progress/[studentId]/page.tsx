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
import { headers } from "next/headers";
import React from "react";

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
  const resStudentProgress = await getStudentProgress(params.studentId);

  return (
    <>
      <Header heading="Progress" />
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
              Your current level is {resStudentProgress.articles[0]?.userLevel || 0}
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
    </>
  );
}


