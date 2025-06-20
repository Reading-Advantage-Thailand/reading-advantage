import LessonCard from "@/components/lesson/lesson-card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import CustomError from "./custom-error";
import ChatBotFloatingChatButton from "@/components/chatbot-floating-button";
import { Article } from "@/components/models/article-model";
import { headers } from "next/headers";

export const metadata = {
  title: "Article",
  description: "Article",
};

async function getArticle(articleId: string) {
  return fetchData(`/api/v1/articles/${articleId}`);
}

export default async function LessonQuizPage({
  params,
}: {
  params: { articleId: string };
}) {
  const t = await getScopedI18n("pages.student.readPage.article");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

  const articleResponse = await getArticle(params.articleId);

  if (articleResponse.message)
    return (
      <CustomError message={articleResponse.message} resp={articleResponse} />
    );

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom/students/${user.id}`,
    {
      method: "GET",
      headers: headers(),
    }
  );
  const data = await response.json();
  const classroomId = data.data;

  return (
    <>
      <div className="md:flex md:flex-row md:gap-3 md:mb-5">
        <LessonCard
          article={articleResponse.article}
          articleId={params.articleId}
          userId={user.id}
          classroomId={classroomId}
        />
      </div>
      <ChatBotFloatingChatButton
        article={articleResponse?.article as Article}
      />
    </>
  );
}
