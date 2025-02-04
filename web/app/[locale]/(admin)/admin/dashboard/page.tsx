import React from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LineChartCustom from "@/components/line-chart";
import LicesneUsageList from "@/components/license-usage-list";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@/server/models/enum";
import UnauthorizedPage from "@/components/shared/unauthorized-page";
import ActiveUsersChart from "@/components/system/active-users";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (user.role !== Role.SYSTEM && user.role !== Role.ADMIN) {
    return <UnauthorizedPage />;
  }

  // Map CEFR levels to numerical values
  const cefrToNumber: Record<string, number> = {
    "A0-": 0,
    A0: 1,
    "A0+": 2,
    A1: 3,
    "A1+": 4,
    "A2-": 5,
    A2: 6,
    "A2+": 7,
    "B1-": 8,
    B1: 9,
    "B1+": 10,
    "B2-": 11,
    B2: 12,
    "B2+": 13,
    "C1-": 14,
    C1: 15,
    "C1+": 16,
    "C2-": 17,
    C2: 18,
  };

  const schoolListfetch = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/licenses/${user.license_id}`,
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

  const UserData = userRoleList?.results?.filter(
    (users: any) => users.license_id && users.license_id === user.license_id
  );

  const sumXp = UserData.reduce((sum: number, user: any) => {
    const xp = parseInt(user.xp) || 0;
    return sum + xp;
  }, 0);

  const countTeachers = UserData.filter(
    (users: any) => users.role === "teacher"
  ).length;

  // Map numerical values back to CEFR levels
  const numberToCefr = Object.fromEntries(
    Object.entries(cefrToNumber).map(([k, v]) => [v, k])
  );

  // // Filter and calculate the average CEFR level
  const cefrValues = UserData.map(
    (user: any) => cefrToNumber[user.cefr_level]
  )?.filter((value: any) => value !== undefined); // Filter out invalid/missing levels

  const averageCefrValue =
    cefrValues?.reduce((sum: number, value: any) => sum + value, 0) /
    cefrValues?.length;

  const averageCefrLevel = numberToCefr[Math.round(averageCefrValue)];

  // Get an array of user IDs from the users array
  const userIds = UserData.map((users: any) => users.id);

  // Filter activityLog based on whether the user_id exists in userIds
  const filteredActivityLog = averageCefrLevelData.data.filter(
    (activity: any) => userIds.includes(activity.userId)
  );

  return (
    <>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
        <Header heading="Admin Dashboard Page" />
        <h1 className="px-2">School : {schoolList.license.school_name}</h1>
      </div>
      <div className="py-2 grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="min-h-10">
            <CardTitle className="text-1xl text-center">
              Total Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">{UserData.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-1xl text-center">
              Average CEFR Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">{averageCefrLevel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-1xl font-medium text-center">
              Total XP Gained (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">
              {sumXp.toLocaleString()} XP
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-1xl text-center">
              Active Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">{countTeachers}</p>
          </CardContent>
        </Card>
      </div>
      <div className="py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Average CEFR Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartCustom data={filteredActivityLog} />
          </CardContent>
        </Card>
      </div>
      <div className="py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">License Usage by School</CardTitle>
          </CardHeader>
          <CardContent>
            <LicesneUsageList data={schoolList.license} />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3">
        <ActiveUsersChart />
      </div>
    </>
  );
}
