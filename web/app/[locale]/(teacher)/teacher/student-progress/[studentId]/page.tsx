import { UserActivityChart } from "@/components/dashboard/user-activity-chart";
import { UserXpOverAllChart } from "@/components/dashboard/user-xpoverall-chart";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { headers } from "next/headers";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import { redirect } from "next/navigation";
import UserActivityHeatMap from "@/components/dashboard/user-activity-heatmap";
import ReadingStatsChart from "@/components/dashboard/user-reading-chart";
import CEFRLevels from "@/components/dashboard/user-level-indicator";

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/activitylog`);
}

export default async function ProgressPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  const t = await getScopedI18n("pages.teacher.studentProgressPage");

  const StudentsData = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${params.studentId}`,
      { method: "GET", headers: headers() }
    );
    if (!res.ok) throw new Error("Failed to fetch StudentData list");
    const fetchdata = await res.json();
    return fetchdata.data;
  };

  const res = await getUserArticleRecords(params.studentId);
  const studentData = await StudentsData();

  return (
    <>
      <div>
        <Header
          heading={t("progressOf", { nameOfStudent: studentData.display_name })}
        />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-4 mb-10">
          <div className="flex flex-col gap-4 col-span-2">
            <UserActivityChart data={res.results} />
            <UserXpOverAllChart data={res.results} />
            <ReadingStatsChart data={res.results} />
          </div>
          <div className="flex flex-col gap-4">
            <CEFRLevels currentLevel={studentData.cefr_level} />
            <UserActivityHeatMap data={res.results} />
          </div>
        </div>
      </div>
    </>
  );
}
