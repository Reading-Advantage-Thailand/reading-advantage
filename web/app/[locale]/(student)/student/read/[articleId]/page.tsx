import ArticleCard from "@/components/article-card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { headers } from "next/headers";
import axios from "axios";
import { getScopedI18n } from "@/locales/server";
import Stats from "@/components/stats";

export const metadata = {
  title: "Article Quiz",
  description: "Article Quiz",
};

async function getArticle(articleId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${articleId}`,
    {
      method: "GET",
      headers: headers(),
    }
  );
  const data = await response.json();
  return data;
}
async function getArticleRecord(userId: string, articleId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/article-records/${articleId}`,
    {
      method: "GET",
      headers: headers(),
    }
  );
  const data = await response.json();
  return data;
}
async function getTranslate(sentences: string[], articleId: string) {
  const res = await axios.post(`/api/articles/${articleId}/translate`, {
    sentences,
    language: "th",
  });
  return res.data;
}

export default async function ArticleQuizPage({
  params,
}: {
  params: { articleId: string };
}) {
  const t = await getScopedI18n("pages.student.readPage.article");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");
  // if (user.level === 0) return redirect("/level");
  let articleResult;
  articleResult = await getArticle(params.articleId);
  console.log("article result", articleResult);
  if (articleResult.message === "Article not found")
    return <div>{t("articleNotFound")}</div>;
  if (articleResult.message === "Insufficient level")
    return <div>{t("articleInsufficientLevel")}</div>;
  if (articleResult.message === "Internal server error")
    return <div>Internal server error</div>;

  const articleRecord = await getArticleRecord(user.id, params.articleId);
  if (articleRecord.message === "Insufficient level")
    return <div>{t("articleInsufficientLevel")}</div>;
  if (articleRecord.message === "Internal server error")
    return <div>Internal server error</div>;

  // Check if article is requiz or not
  // If article is requiz, show stats
  const isRequiz = articleRecord.message === "Record not found" ? false : true;

  // check that article has questions
  if (!articleResult.article.questions) {
    console.log("article has no questions");
    // console.log("articleResult", articleResult);
    try {
      const generateQuestions = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/assistant/questions`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            articleId: params.articleId,
            threadId: articleResult.article.threadId,
          }),
        },
      );
      if (generateQuestions.status === 200) {
        // recall getArticle to get the updated article
        console.log('recall getArticle')
        articleResult = await getArticle(params.articleId);
        // refresh the page
        return;
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <>
      {isRequiz && <Stats articleRecord={articleRecord.userArticleRecord} />}
      <ArticleCard
        article={articleResult.article}
        articleId={params.articleId}
        userId={user.id}
      />
    </>
  );
}
