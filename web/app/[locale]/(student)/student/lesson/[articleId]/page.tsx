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
  title: "Lesson",
  description: "Interactive Reading Lesson",
};

async function getArticle(articleId: string) {
  return fetchData(`/api/v1/articles/${articleId}`);
}

export default async function LessonPage({
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
    // ...existing code...
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-[hsl(222.2_90%_4.9%)] to-20% rounded-xl">
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Lesson Content */}
        <div className="relative">
          <LessonCard
            article={articleResponse.article}
            articleId={params.articleId}
            userId={user.id}
            classroomId={classroomId}
          />

          {/* Floating Chatbot */}
          <ChatBotFloatingChatButton
            article={articleResponse?.article as Article}
          />
        </div>
      </div>
    </div>
  );
}
