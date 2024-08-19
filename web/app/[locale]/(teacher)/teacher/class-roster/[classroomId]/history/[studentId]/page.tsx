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

async function getUserArticleRecords(studentId: string) {
  // return fetchData(`/api/v1/users/${studentId}/records`, {
  //   log: true,
  // });
  return fetchData(`/api/v1/users/${studentId}/activitylog`, {
    log: true,
  });
}

export default async function StudentHistoryForTeacher(params: {
  params: { studentId: string; classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  // if (user.cefr_level === "" && user.level === 0) {
  //   return redirect("/level");
  // }
  const res = await getUserArticleRecords(params.params.studentId);

  // articles that have been read
  // put the articles that have rating lower than 3 in the reminder table
  // const reminderArticles = res.results.filter(
  //   (article: any) => article.rated < 3
  // );
  //   // put the results that have rating higher than 3 in the article records table
  // const articleRecords = res.results.filter(
  //   (article: any) => article.rated >= 3
  // );

  // const t = await getScopedI18n("pages.student.historyPage");
  const t = await getScopedI18n("pages.student.reportpage");

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
        {/* <Header heading={t("title", { userName })} /> */}
        {/* <Header heading={t("title")} /> */}
        <Header heading={`User Activity of ${userName}`} />
      </div>
      {/* {reminderArticles.length !== 0 && (
        <>
          <Header
            heading={t("reminderToReread")}
            text={t("reminderToRereadDescription")}
            variant="warning"
          />
          <ReminderRereadTable articles={reminderArticles} />
        </>
      )}
      <Header
        heading={t("articleRecords")}
        text={t("articleRecordsDescription")}
      />
      <ArticleRecordsTable articles={articleRecords} /> */}


{/* <UserRecentActivity data={res.results} />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-4 mb-10">
        <div className="flex flex-col gap-4 col-span-2">
          <UserActivityChart data={res.results} />
          <UserXpOverAllChart data={res.results} />
          <ReadingStatsChart data={res.results} />
        </div>
        <div className="flex flex-col gap-4">
          <CEFRLevels currentLevel={user.cefr_level} />
          <UserActivityHeatMap data={res.results} />
        </div>
      </div> */}
    </div>
  );
}
