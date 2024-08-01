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
import { fetchData } from "@/utils/fetch-data";
import { database } from "firebase-admin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { UserArticleRecord } from "@/components/models/user-article-record-model";
import { DateField } from "@/components/ui/date-field";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
// import HeatMap from "react-heatmap-grid";

type Props = {};

// async function getUserArticleRecords(userId: string) {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/article-records`,
//     {
//       method: "GET",
//       headers: headers(),
//       next: { revalidate: 0 },
//     }
//   );
//   return res.json();
// }

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/activitylog`);
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

// async function getHeatMapData(userId: string) {
//   return fetchData(`/api/v1/users/${userId}/heatmap`, { log: true });
// }

export default async function ReportsPage({}: Props) {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  // if (user.level === 0) return redirect('/level');
  const res = await getUserArticleRecords(user.id);
  const resGeneralDescription = await getGeneralDescription(user.level);

  const inProgressCount = res.results.filter(
    (item: UserArticleRecord) => item.activityStatus === "in_progress"
  ).length;

  const completedCount = res.results.filter(
    (item: UserArticleRecord) => item.activityStatus === "completed"
  ).length;

  // const resHeatMap = await getHeatMapData(user.id);
  // const xLabels = Object.keys(resHeatMap.results);
  // const yLabels = ["completed", "read"];
  // const matrixData = yLabels.map((y) =>
  //   xLabels.map((x) => resHeatMap.results[x][y])
  // );
  return (
    <>
      <Header heading="User Activity" />
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-4 mb-10">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Activity Progress</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Card>
              <CardContent className="py-2">
                <CardTitle>In prograss</CardTitle>
                <p className="font-bold text-2xl">{inProgressCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-2">
                <CardTitle>Completed</CardTitle>
                <p className="font-bold text-2xl">{completedCount}</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>XP Earn</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <UserLevelChart
              data={res.results}
              resGeneralDescription={resGeneralDescription}
            />
          </CardContent>
        </Card>
        {/* <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Level</CardTitle>
            <CardDescription>
              Your current level is {user.level}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserLevelChart
              data={res.results}
              resGeneralDescription={resGeneralDescription}
            />
          </CardContent>
        </Card> */}
        {/* <HeatMap xLabels={xLabels} yLabels={yLabels} data={matrixData} /> */}
      </div>
    </>
  );
}
