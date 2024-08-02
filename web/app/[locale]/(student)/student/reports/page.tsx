import { UserLevelChart } from "@/components/dashboard/user-level-chart";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { fetchData } from "@/utils/fetch-data";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/activitylog`);
}

export default async function ReportsPage({}: Props) {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  const res = await getUserArticleRecords(user.id);

  return (
    <>
      <Header heading="User Activity" />
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-4 mb-10">
        <UserLevelChart data={res.results} />
      </div>
    </>
  );
}
