import ArticleCard from "@/components/article-card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { headers } from "next/headers";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Header } from "@/components/header";
import { getScopedI18n } from "@/locales/server";
import Stats from "@/components/stats";
import { UserArticleRecordType } from "@/types";

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
  if (user.level === 0) return redirect("/level");

  const articleResult = await getArticle(params.articleId);
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
