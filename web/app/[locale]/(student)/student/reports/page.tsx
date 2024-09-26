import { UserActivityChart } from "@/components/dashboard/user-activity-chart";
import UserActivityHeatMap from "@/components/dashboard/user-activity-heatmap";
import { UserXpOverAllChart } from "@/components/dashboard/user-xpoverall-chart";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { fetchData } from "@/utils/fetch-data";
import { redirect } from "next/navigation";
import React from "react";
import ReadingStatsChart from "@/components/dashboard/user-reading-chart";
import CEFRLevels from "@/components/dashboard/user-level-indicator";
import { CloudFog } from "lucide-react";
import UserRecentActivity from "@/components/dashboard/user-recent-activity";
import { getScopedI18n } from "@/locales/server";

type Props = {};

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/users/${userId}/activitylog`);
}

export default async function ReportsPage({}: Props) {
  const t = await getScopedI18n("pages.student.reportpage");
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  const res = await getUserArticleRecords(user.id);

  return (
    <>
      <Header heading={t("title")} />
      <UserRecentActivity data={res.results} />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-4 mb-10">
        <div className="flex flex-col gap-4 col-span-2">
          <UserActivityChart data={res.results} />
          <UserXpOverAllChart data={res.results} />
          <ReadingStatsChart data={res.results} />
        </div>
        <div className="flex flex-col gap-4">
          <CEFRLevels currentLevel={user.cefr_level} />
          <UserActivityHeatMap data={res.results} />
        </div>
      </div>
    </>
  );
}
