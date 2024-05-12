import { ArticleRecordsTable } from "@/components/article-records-table";
import { Header } from "@/components/header";
import { ReminderRereadTable } from "@/components/reminder-reread-table";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";

type Props = {};

export const metadata = {
  title: "History",
};

async function getUserArticleRecords(userId: string) {
  return fetchData(`/api/v1/users/${userId}/records`, {
    log: true,
  });
}

// async function getNextPage(userId: string, nextPage: any) {
//   const data = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${userId}/records`,
//     {
//       method: "POST",
//       headers: headers(),
//       body: JSON.stringify({ nextPage }),
//     }
//   );
//   console.log("data", data);
//   return data.json();
// }
export default async function HistoryPage({}: Props) {
  // const t = useTranslations('pages.student.article-records')
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.cefrLevel === "" && user.level === 0) {
    return redirect("/level");
  }
  const res = await getUserArticleRecords(user.id);
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
    <>
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
    </>
  );
}
