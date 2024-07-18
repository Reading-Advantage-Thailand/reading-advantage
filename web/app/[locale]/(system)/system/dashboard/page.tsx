import ActivityDistributionPieChart from "@/components/system/activity-distribution-pieChart";
import React from "react";
import { Header } from "@/components/header";
import ChallengingQuestionsTable from "@/components/system/challengingQuestionsTable";
import LicenseUsageOverTimeChart from "@/components/system/license-usage-overtime";
import LicenseUsageChart from "@/components/system/license-usage";
import ArticlesByTypeAndGenreChart from "@/components/system/articles-type-genre";
import TopSchoolByXPGainedChart from "@/components/system/top-schools-xp-gained";
import ActiveUsersChart from "@/components/system/active-users";
import ArticlesPerLevelChart from "@/components/system/articles-per-level";
import { headers } from "next/headers";

export default async function SystemDashboardPage() {
  const fetchArticlesCount = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/system/dashboard`,
        {
          method: "GET",
          headers: headers(),
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("failed to fetch articles count: ", error);
    }
  };

  const articlesPerLevel = await fetchArticlesCount();

  return (
    <>
      <Header heading="System Dashboard Page" />
      <div className="p-4 grid grid-cols-3 gap-4 auto-rows-auto">
        {/* Activity Distribution */}
        <ActivityDistributionPieChart />

        {/* License Usage */}
        <LicenseUsageChart />

        {/* License Usage Over Time */}
        <LicenseUsageOverTimeChart />

        {/* Most Challenging Questions */}
        <ChallengingQuestionsTable />

        {/* Articles by Type and Genre */}
        <ArticlesByTypeAndGenreChart />

        {/* Top Schools by XP Gained */}
        <TopSchoolByXPGainedChart />

        {/* Articles per Level */}
        <ArticlesPerLevelChart articlesPerLevel={articlesPerLevel} />

        {/* Active Users */}
        <ActiveUsersChart />
      </div>
    </>
  );
}
