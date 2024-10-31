"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserRoleManagement from "@/components/user-role-management";
import LineChartCustom from "@/components/line-chart";
import PieChartCustom from "@/components/pie-chart";
import LicesneUsageList from "@/components/license-usage-list";
import { UserActivityLog } from "../models/user-activity-log-model";

// Map CEFR levels to numerical values
const cefrToNumber = {
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

interface School {
  id: string;
  school_name: string;
  total_licenses: number;
  used_licenses: number;
}

interface SchoolList {
  data: School[];
}

interface UserRole {
  id: string;
  name: string;
  email: string;
  role: string;
  license_id: string;
  xp: string;
  cefr_level: keyof typeof cefrToNumber;
}

interface UserRoleList {
  results: UserRole[];
}

interface CefrLevelData {
  data: UserActivityLog[];
}

async function ShcoolsDashboard({
  schoolList,
  userRoleList,
  averageCefrLevelData,
}: {
  schoolList: SchoolList;
  userRoleList: UserRoleList;
  averageCefrLevelData: CefrLevelData;
}) {
  const totalLicenses = schoolList.data.reduce(
    (sum, item) => sum + (item?.total_licenses || 0),
    0
  );
  const usedLicenses = schoolList.data.reduce(
    (sum, item) => sum + (item?.used_licenses || 0),
    0
  );
  const availableLicenses = totalLicenses - usedLicenses;

  const countTeachers = userRoleList?.results?.filter(
    (users) => users.role === "teacher"
  ).length;

  const countActiveUsers = userRoleList?.results?.filter(
    (users) => users.license_id && users.license_id !== ""
  ).length;

  const sumXp = userRoleList?.results?.reduce((sum, user) => {
    const xp = parseInt(user.xp) || 0;
    return sum + xp;
  }, 0);

  // Map numerical values back to CEFR levels
  const numberToCefr = Object.fromEntries(
    Object.entries(cefrToNumber).map(([k, v]) => [v, k])
  );

  // // Filter and calculate the average CEFR level
  const cefrValues = userRoleList?.results
    ?.map((user) => cefrToNumber[user.cefr_level])
    ?.filter((value) => value !== undefined); // Filter out invalid/missing levels

  const averageCefrValue =
    cefrValues?.reduce((sum, value) => sum + value, 0) / cefrValues?.length;

  const averageCefrLevel = numberToCefr[Math.round(averageCefrValue)];

  //   const handleSchoolChange = (value: string) => {
  //     const newData = schoolList.data.filter(
  //       (school: any) => school?.id === value
  //     );
  //     setData(newData);
  //   };

  return (
    <>
      {/* <div className="py-2">
        <Card className="flex items-center">
          <CardHeader>
            <CardTitle>Selete School :</CardTitle>
          </CardHeader>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a School" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {schoolList.data.map(
                  (
                    school: { id: string; school_name: string },
                    index: number
                  ) => (
                    <SelectItem key={index} value={school.id}>
                      {school.school_name}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Card>
      </div> */}
      <div className="py-2 grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 ">
        <Card>
          <CardHeader className="min-h-10">
            <CardTitle className="text-1xl text-center">
              Total Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center">{countActiveUsers}</p>
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
            <CardTitle className="text-1xl text-center">
              Average CEFR Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartCustom data={averageCefrLevelData.data} />
          </CardContent>
        </Card>
      </div>
      <div className="py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">License Usage by School</CardTitle>
          </CardHeader>
          <CardContent>
            <LicesneUsageList data={schoolList.data} />
          </CardContent>
        </Card>
      </div>
      <div className="py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">License Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Licenses: {totalLicenses}</p>
            <p>Used Licenses: {usedLicenses}</p>
            <p>Available Licenses: {availableLicenses}</p>
            <PieChartCustom
              availableLicenses={availableLicenses}
              usedLicenses={usedLicenses}
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
            <UserRoleManagement data={userRoleList?.results} page="system" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ShcoolsDashboard;
