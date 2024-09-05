import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import Reports from "@/components/teacher/reports";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ClassroomData from "@/lib/classroom-utils";
import { ClassesData } from "@/lib/classroom-utils";
import { fetchData } from "@/utils/fetch-data";

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/activitylog`);
}

export default async function ReportsPage(params: {
  params: { classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const res = await ClassroomData({
    params: { classroomId: params.params.classroomId },
  });
  const studentsMapped = res.studentsMapped;
  const classrooms = res.classrooms;

  const classesRes = await ClassesData();
  const classes = classesRes.classes;

  const lastActivityTimestamp: { [key: string]: string } = {};

  for (let i = 0; i < studentsMapped.length; i++) {
    const studentId = studentsMapped[i].studentId;

    if (!studentId) {
      continue;
    }

    const results = await getUserArticleRecords(studentId);

    const userRecordsMatch = results.results.filter(
      (record: any) => record.userId === studentId
    );

    if (userRecordsMatch.length > 0) {
      const sortedData = results.results
        .sort((a: any, b: any) => {
          const timestampA = new Date(a.timestamp).getTime();
          const timestampB = new Date(b.timestamp).getTime();
          return timestampB - timestampA;
        })
        .map((item: any) => {
          const date = new Date(item.timestamp);
          const formattedDate = date.toISOString().split("T")[0];
          return {
            ...item,
            formattedTimestamp: formattedDate,
          };
        });

      const lasttimestamp = sortedData[0].formattedTimestamp;
      lastActivityTimestamp[studentId] = lasttimestamp;
    } else {
      lastActivityTimestamp[studentId] = "No Activity";
    }
  }

  const sortedLastActivityTimestamp = Object.entries(
    lastActivityTimestamp
  ).sort(([timestampA], [timestampB]) => {
    if (timestampA === "No Activity") return 1;
    if (timestampB === "No Activity") return -1;
    return new Date(timestampB).getTime() - new Date(timestampA).getTime();
  });

  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <Reports
          studentInClass={studentsMapped}
          userId={user.id}
          classrooms={classrooms}
          classes={classes}
          userArticleRecords={sortedLastActivityTimestamp}
        />
      </NextAuthSessionProvider>
    </div>
  );
}
