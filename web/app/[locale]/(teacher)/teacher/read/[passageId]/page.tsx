import ArticleCard from "@/components/article-card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { headers } from "next/headers";
import axios from "axios";
import { getScopedI18n } from "@/locales/server";
import Stats from "@/components/stats";
import TeacherReadArticleCard  from "@/components/teacher/teacherReadArticleCard";

// export const metadata = {
//   title: "Teahcer Read Assignment Page",
//   description: "Teahcer Read Assignment Page",
// };

async function getArticle(passageId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${passageId}`,
    {
      method: "GET",
      headers: headers(),
    }
  );
  const data = await response.json();
  return data;
}

export default async function TeacherReadAssignmentPage({
  params,
}: {
  params: { passageId: string };
}) {
  const t = await getScopedI18n("pages.student.readPage.article");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  let articleResult;
  articleResult = await getArticle(params.passageId);
  console.log("article result", articleResult);
  if (articleResult.message === "Article not found")
    return <div>{t("articleNotFound")}</div>;
  if (articleResult.message === "Insufficient level")
    return <div>{t("articleInsufficientLevel")}</div>;
  if (articleResult.message === "Internal server error")
    return <div>Internal server error</div>;

  return (
    <>
      <TeacherReadArticleCard
        article={articleResult.article}
        articleId={params.passageId}
        userId={user.id}
      />
      
    </>
  );
}
