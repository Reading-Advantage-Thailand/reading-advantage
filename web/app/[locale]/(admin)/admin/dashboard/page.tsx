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
import UnauthorizedPage from "@/components/shared/unauthorized-page";
import ActiveUsersChart from "@/components/system/active-users";
import ClassRoomXpChart from "@/components/dashboard/classroom-xp-chart";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (!user.license_id) {
    return <UnauthorizedPage />;
  }

  const getDashboradData = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/admin/dashboard`,
      { method: "GET", headers: headers() }
    );
    const fetchdata = await res.json();
    return fetchdata.data;
  };

  const dataDashboard = await getDashboradData();

  return (
    <>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
        <Header heading="Admin Dashboard Page" />
        <h1 className="px-2">
          School : {dataDashboard?.license[0].school_name}
        </h1>
      </div>
      <div className="py-2 grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="min-h-10">
            <CardTitle className="text-1xl text-center">
              Total Licensed Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">
              {dataDashboard?.license[0].total_licenses}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-1xl text-center">
              Average CEFR Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">
              {dataDashboard?.averageCefrLevel}
            </p>
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
              {dataDashboard?.xpEarned.toLocaleString()} XP
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-1xl text-center">
              Licensed Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">
              {dataDashboard?.teacherCount}
            </p>
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
            <LineChartCustom data={dataDashboard?.filteredActivityLog} />
          </CardContent>
        </Card>
      </div>
      <div>
        <ClassRoomXpChart licenseId={dataDashboard?.license[0].id} />
      </div>
      <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3">
        <ActiveUsersChart
          page={"admin"}
          licenseId={dataDashboard?.license[0].id}
        />
      </div>
    </>
  );
}
