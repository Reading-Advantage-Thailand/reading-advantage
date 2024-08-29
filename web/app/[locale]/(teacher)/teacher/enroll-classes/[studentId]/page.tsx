import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import MyEnrollClasses from "@/components/teacher/enroll-classes";
import { StudentsData } from "@/lib/classroom-utils";
import { fetchData } from "@/utils/fetch-data";

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/activitylog`);
}

export default async function EnrollPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const res = await StudentsData({ params: { studentId: params.studentId } });
  const matchedNameOfStudent = res.matchedNameOfStudents;
  const differentClasses = res.differentClasses;
  const matchedStudents = res.matchedStudents;
  const sortedLastActivityTimestamp = res.sortedLastActivityTimestamp;
  // const lastActivityTimestamp: { [key: string]: string } = {};
  // const results = await getUserArticleRecords(params.studentId);

  // const userRecordsMatch = results.results.filter(
  //   (record: any) => record.userId === params.studentId
  // );

  // if (userRecordsMatch.length > 0) {
  //   const sortedData = results.results
  //     .sort((a: any, b: any) => {
  //       const timestampA = new Date(a.timestamp).getTime();
  //       const timestampB = new Date(b.timestamp).getTime();
  //       return timestampB - timestampA;
  //     })
  //     .map((item: any) => {
  //       const date = new Date(item.timestamp);
  //       const formattedDate = date.toISOString().split("T")[0];
  //       return {
  //         ...item,
  //         formattedTimestamp: formattedDate,
  //       };
  //     });

  //   const lasttimestamp = sortedData[0].formattedTimestamp;
  //   lastActivityTimestamp[params.studentId] = lasttimestamp;
  // } else {
  //   lastActivityTimestamp[params.studentId] = "No Activity";
  // }


// const sortedLastActivityTimestamp = Object.entries(
//   lastActivityTimestamp
// ).sort(([timestampA], [timestampB]) => {
//   if (timestampA === "No Activity") return 1;
//   if (timestampB === "No Activity") return -1;
//   return new Date(timestampB).getTime() - new Date(timestampA).getTime();
// });


  return (
    <div>
      <NextAuthSessionProvider session={user}>
        <MyEnrollClasses
          enrolledClasses={differentClasses}
          studentId={params.studentId}
          matchedStudents={matchedStudents}
          matchedNameOfStudent={matchedNameOfStudent}
          // userArticleRecords={sortedLastActivityTimestamp}
          sortedLastActivityTimestamp={sortedLastActivityTimestamp}
        />
      </NextAuthSessionProvider>
    </div>
  );
}
