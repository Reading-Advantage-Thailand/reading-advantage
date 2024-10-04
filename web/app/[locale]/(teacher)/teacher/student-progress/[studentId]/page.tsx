import { UserActivityChart } from "@/components/dashboard/user-activity-chart";
import { UserXpOverAllChart } from "@/components/dashboard/user-xpoverall-chart";
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
import UserActivityHeatMap from "@/components/dashboard/user-activity-heatmap";
import ReadingStatsChart from "@/components/dashboard/user-reading-chart";
import CEFRLevels from "@/components/dashboard/user-level-indicator";

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
  return fetchData(`/api/v1/users/${userId}/activitylog`);
}

// async function getGeneralDescription(userLevel: number) {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/master-data/level-mean/${userLevel}`,
//     {
//       method: "GET",
//       headers: headers(),
//     }
//   );
//   return res.json();
// }

async function getAllStudentData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom/students`,
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

export default async function ProgressPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  const resStudentProgress = await getUserArticleRecords(params.studentId);
  const t = await getScopedI18n("pages.teacher.studentProgressPage");

  const allStudent = await getAllStudentData();

  let nameOfStudent = "";
  let studentLevel: number = 0;
  let cefr_level = "";

  allStudent.students.forEach(
    (student: {
      id: string;
      name: string;
      level: number;
      cefr_level: string;
    }) => {
      if (student.id === params.studentId) {
        nameOfStudent = student.name;
        studentLevel = student.level;
        cefr_level = student.cefr_level;
      }
    }
  );

  return (
    <>
      {resStudentProgress.results ? (
        <div>
          <Header heading={t("progressOf", { nameOfStudent: nameOfStudent })} />
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-4 mb-10">
            <div className="flex flex-col gap-4 col-span-2">
              <UserActivityChart data={resStudentProgress.results} />
              <UserXpOverAllChart data={resStudentProgress.results} />
              <ReadingStatsChart data={resStudentProgress.results} />
            </div>
            <div className="flex flex-col gap-4">
              <CEFRLevels currentLevel={cefr_level} />
              <UserActivityHeatMap data={resStudentProgress.results} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center">{t("noUserProgress")}</p>
      )}
    </>
  );
}
