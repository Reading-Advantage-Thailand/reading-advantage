import ArticleCard from "@/components/article-card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import CustomError from "./custom-error";
import AssignDialog from "@/components/teacher/assign-dialog";
import ChatBotFloatingChatButton from "@/components/chatbot-floating-button";
import { Article } from "@/components/models/article-model";
import ArticleActions from "@/components/article-actions";
import WordList from "@/components/word-list";
import LAQuestionCard from "@/components/questions/laq-question-card";
import MCQuestionCard from "@/components/questions/mc-question-card";
import SAQuestionCard from "@/components/questions/sa-question-card";
import PrintArticle from "@/components/teacher/print-article";
import ExportWorkbookButton from "@/components/teacher/export-workbook-button";
import ArticleLesson from "@/components/lesson/lesson-button";

export const metadata = {
  title: "Article",
  description: "Article",
};

async function getArticle(articleId: string) {
  return fetchData(`/api/v1/articles/${articleId}`);
}

async function getClassroom() {
  return fetchData(`/api/v1/classrooms`);
}

export default async function ArticleQuizPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  const t = await getScopedI18n("pages.student.readPage.article");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

  const isAtLeastTeacher = (role: string) =>
    role.includes("TEACHER") ||
    role.includes("ADMIN") ||
    role.includes("SYSTEM");

  const isAboveTeacher = (role: string) =>
    role.includes("ADMIN") || role.includes("SYSTEM");

  const articleResponse = await getArticle(articleId);

  if (articleResponse.message)
    return (
      <CustomError message={articleResponse.message} resp={articleResponse} />
    );

  return (
    <>
      <div className="md:flex md:flex-row md:gap-3 md:mb-5">
        <ArticleCard
          article={articleResponse.article}
          articleId={articleId}
          userId={user.id}
        />
        <div className="flex flex-col gap-4 mb-40 mt-4 max-w-[400px]">
          {/* Teacher Tools Section */}
          {isAtLeastTeacher(user.role) && (
            <div className="flex gap-2 justify-center items-center flex-wrap bg-white/5 p-3 rounded-lg border border-white/10">
              <PrintArticle
                articleId={articleId}
                article={articleResponse.article}
              />
              {isAboveTeacher(user.role) && (
                <ExportWorkbookButton
                  articleId={articleId}
                  article={articleResponse.article}
                />
              )}
              {isAboveTeacher(user.role) && (
                <ArticleActions
                  article={articleResponse.article}
                  articleId={articleId}
                />
              )}
              <AssignDialog
                article={articleResponse.article}
                articleId={articleId}
                userId={user.id}
              />
            </div>
          )}

          {/* Student Actions Section */}
          <div className="flex gap-2 justify-center items-center flex-wrap">
            <WordList
              article={articleResponse.article}
              articleId={articleId}
              userId={user.id}
            />
            <ArticleLesson
              article={articleResponse.article}
              articleId={articleId}
              userId={user.id}
            />
          </div>

          <div className="max-w-[400px]">
            <MCQuestionCard
              userId={user.id}
              articleId={articleId}
              articleTitle={articleResponse.article.title}
              articleLevel={articleResponse.article.ra_level}
              page="article"
            />
          </div>
          <div className="max-w-[400px]]">
            <SAQuestionCard
              userId={user.id}
              articleId={articleId}
              articleTitle={articleResponse.article.title}
              articleLevel={articleResponse.article.ra_level}
              page="article"
            />
          </div>
          <div className="max-w-[400px]">
            <LAQuestionCard
              userId={user.id}
              articleId={articleId}
              userLevel={user.level}
              articleTitle={articleResponse.article.title}
              articleLevel={articleResponse.article.ra_level}
              userLicenseLevel={
                user.license_level === "EXPIRED"
                  ? undefined
                  : user.license_level
              }
            />
          </div>
        </div>
      </div>
      <ChatBotFloatingChatButton
        article={articleResponse?.article as Article}
      />
    </>
  );
}
