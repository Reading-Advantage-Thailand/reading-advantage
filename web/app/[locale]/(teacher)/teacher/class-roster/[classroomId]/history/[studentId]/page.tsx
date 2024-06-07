
import React from 'react'
import { ArticleRecordsTable } from "@/components/article-records-table";
import { Header } from "@/components/header";
import { ReminderRereadTable } from "@/components/reminder-reread-table";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import { RosterPage } from '@/lib/teacher-utils';


async function getUserArticleRecords(studentId: string) {
    return fetchData(`/api/v1/users/${studentId}/records`, {
      log: true,
    });
  }

export default async function StudentHistoryForTeacher( params : {params:{studentId: string, classroomId: string} } ) {
    const user = await getCurrentUser();
    if (!user) {
      return redirect("/auth/signin");
    }
    if (user.cefrLevel === "" && user.level === 0) {
      return redirect("/level");
    }
    const res = await getUserArticleRecords(params.params.studentId);
    
    // articles that have been read
    // put the articles that have rating lower than 3 in the reminder table
    const reminderArticles = res.results.filter(
      (article: any) => article.rated < 3
    );
    //   // put the results that have rating higher than 3 in the article records table
    const articleRecords = res.results.filter(
      (article: any) => article.rated >= 3
    );
    const t = await getScopedI18n("pages.student.historyPage");

    let userName = "";
    const studentsMapped = await RosterPage({params: {classroomId: params.params.classroomId}});
    
    studentsMapped.forEach((student: { studentId: string; studentName: string; }) => {
      if (student.studentId === params.params.studentId) {
        userName = student.studentName;
        }});
        
  return (
    <div>
      <div className='mb-4'>
        <Header
          heading={t("title", { userName })}  
        />
      </div>
      {reminderArticles.length !== 0 && (
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
      <ArticleRecordsTable articles={articleRecords} />
    </div>
  )
}

