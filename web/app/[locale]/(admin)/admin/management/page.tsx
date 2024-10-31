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
import UserRoleManagement from "@/components/user-role-management";
import PieChartCustom from "@/components/pie-chart";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import UnauthorizedPage from "@/components/shared/unauthorized-page";
import { Role } from "@/server/models/enum";

export default async function AdminManagementPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (user.role !== Role.SYSTEM && user.role !== Role.ADMIN) {
    return <UnauthorizedPage />;
  }

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

  const schoolList = await schoolListfetch();
  const userRoleList = await userRoleListfetch();

  const filterData = userRoleList.results.filter(
    (users: any) => users.license_id === user.license_id
  );

  const availableLicenses =
    schoolList.license.total_licenses - schoolList.license.used_licenses;

  return (
    <>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold  truncate">
        <Header heading="Admin Management Page" />
        <h1 className="px-2">School : {schoolList.license.school_name}</h1>
      </div>
      <div className="py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">License Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Licenses: {schoolList.license.total_licenses}</p>
            <p>Used Licenses: {schoolList.license.used_licenses}</p>
            <p>Available Licenses: {availableLicenses}</p>
            <PieChartCustom
              availableLicenses={availableLicenses}
              usedLicenses={schoolList.license.used_licenses}
            />
          </CardContent>
        </Card>
      </div>
      <div className="py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Users Role Management</CardTitle>
          </CardHeader>
          <CardContent>
            <UserRoleManagement data={filterData} page="admin" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
