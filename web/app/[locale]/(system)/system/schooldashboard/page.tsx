import React from "react";
import { Header } from "@/components/header";
import ShcoolsDashboard from "@/components/system/shcools-dashboard";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import UnauthorizedPage from "@/components/shared/unauthorized-page";
import { headers } from "next/headers";

export default async function SchoolsDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (user.role !== Role.SYSTEM) {
    return <UnauthorizedPage />;
  }

  const schoolListfetch = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/licenses`,
      { method: "GET", headers: headers() }
    );
    if (!res.ok) throw new Error("Failed to fetch school list");
    const fetchdata = await res.json();
    return fetchdata;
  };

  const userRoleListfetch = async () => {
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users`,
      { method: "GET", headers: headers() }
    );
    if (!userRes.ok) throw new Error("Failed to fetch user role list");
    const userData = await userRes.json();
    return userData;
  };

  const averageCefrLevelDatafetch = async () => {
    const cefrRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/activity/all`,
      { method: "GET", headers: headers() }
    );
    if (!cefrRes.ok) throw new Error("Failed to fetch CEFR level data");
    const cefrData = await cefrRes.json();
    return cefrData;
  };

  const schoolList = await schoolListfetch();
  const userRoleList = await userRoleListfetch();
  const averageCefrLevelData = await averageCefrLevelDatafetch();

  return (
    <>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold  truncate">
        <Header heading="Schools Dashboard Page" />
      </div>
      <ShcoolsDashboard
        schoolList={schoolList}
        userRoleList={userRoleList}
        averageCefrLevelData={averageCefrLevelData}
      />
    </>
  );
}
