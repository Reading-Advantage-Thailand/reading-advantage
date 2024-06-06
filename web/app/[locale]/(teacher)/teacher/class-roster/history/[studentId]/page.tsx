
import React from 'react'
import { ArticleRecordsTable } from "@/components/article-records-table";
import { Header } from "@/components/header";
import { ReminderRereadTable } from "@/components/reminder-reread-table";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";

type Props = {
   params: {studentId: string};  
};

async function getUserArticleRecords(studentId: string) {
    return fetchData(`/api/v1/users/${studentId}/records`, {
      log: true,
    });
  }

export default async function StudentHistoryForTeacher( params : {params:{studentId: string} } ) {
  console.log('params', params.params.studentId);
  
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

  return (
    <div>
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

