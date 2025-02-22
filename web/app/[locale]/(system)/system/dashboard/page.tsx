import ActivityDistributionPieChart from "@/components/system/activity-distribution-pieChart";
import React from "react";
import { Header } from "@/components/header";
import LowestRatedArticlesTable from "@/components/system/LowestLatedArticlesTable";
import LicenseUsageChart from "@/components/system/license-usage";
import ArticlesByTypeAndGenreChart from "@/components/system/articles-type-genre";
import TopSchoolByXPGainedChart from "@/components/system/top-schools-xp-gained";
import ActiveUsersChart from "@/components/system/active-users";
import ArticlesPerLevelChart from "@/components/system/articles-per-level";
import { headers } from "next/headers";

export default async function SystemDashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const fetchArticlesCount = async () => {
    try {
      const queryString = new URLSearchParams(
        searchParams as Record<string, string>
      ).toString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/system/dashboard?${queryString}`,
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

  const fetchTopSchoolsByXp = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/system/dashboard/xpBySchools`,
        {
          method: "GET",
          headers: headers(),
        }
      );
      const { data } = await res.json();
      return data; 
    } catch (error) {
      console.error("failed to fetch articles count: ", error);
    }
  };

  const topSchoolByXP = await fetchTopSchoolsByXp();

  return (
    <>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold  truncate">
        <Header heading="System Dashboard Page" />
      </div>
      <div className="p-4 grid gap-4 grid-cols-1 auto-rows-auto sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <ActivityDistributionPieChart />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <LicenseUsageChart />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <TopSchoolByXPGainedChart  topSchoolByXP={topSchoolByXP} />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3">
          <LowestRatedArticlesTable />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3">
          <ArticlesByTypeAndGenreChart />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3">
          <ArticlesPerLevelChart articlesPerLevel={articlesPerLevel} />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3">
          <ActiveUsersChart page="system" />
        </div>
      </div>
    </>
  );
}
