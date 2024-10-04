import React from "react";
import { ArticleRecordsTable } from "@/components/article-records-table";
import { Header } from "@/components/header";
import { ReminderRereadTable } from "@/components/reminder-reread-table";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import ClassroomData from "@/lib/classroom-utils";
import UserRecentActivity from "@/components/dashboard/user-recent-activity";
import { UserActivityChart } from "@/components/dashboard/user-activity-chart";
import { UserXpOverAllChart } from "@/components/dashboard/user-xpoverall-chart";
import ReadingStatsChart from "@/components/dashboard/user-reading-chart";
import CEFRLevels from "@/components/dashboard/user-level-indicator";
import UserActivityHeatMap from "@/components/dashboard/user-activity-heatmap";
import TeacherHistory from "@/components/teacher/history";

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/activitylog`);
}

export default async function StudentHistoryForTeacher(params: {
  params: { studentId: string; classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  const res = await getUserArticleRecords(params.params.studentId);

  //   // put the results that have rating higher than 3 in the article records table
  const articleRecords = res.results.filter(
    (article: any) => article.rated >= 3
  );

  let userName = "";
  if (params && params.params) {
    const classroomRes = await ClassroomData({
      params: { classroomId: params.params.classroomId },
    });

    classroomRes.studentsMapped.forEach(
      (student: { studentId: string; studentName: string }) => {
        if (student.studentId === params.params.studentId) {
          userName = student.studentName;
        }
      }
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Header heading={`History Activity of ${userName}`} />
        <TeacherHistory userActivityLog={articleRecords} />
      </div>
    </div>
  );
}
