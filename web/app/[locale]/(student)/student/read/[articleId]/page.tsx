import ArticleCard from "@/components/article-card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import CustomError from "./custom-error";
import MCQuestionCard from "@/components/questions/mc-question-card";
import SAQuestionCard from "@/components/questions/sa-question-card";
import AssignDialog from "@/components/teacher/assign-dialog";
import ChatBotFloatingChatButton from "@/components/chatbot-floating-button";
import WordList from "@/components/word-list";
import { Article } from "@/components/models/article-model";
import ArticleActions from "@/components/article-actions";
import LAQuestionCard from "@/components/questions/laq-question-card";

export const metadata = {
  title: "Article",
  description: "Article",
};

async function getArticle(articleId: string) {
  return fetchData(`/api/v1/articles/${articleId}`);
}

export default async function ArticleQuizPage({
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

  return (
    <>
      <div className="md:flex md:flex-row md:gap-3 md:mb-5">
        <ArticleCard
          article={articleResponse.article}
          articleId={params.articleId}
          userId={user.id}
        />
        <div className="flex flex-col mb-40 md:mb-0 md:basis-2/5 mt-4">
          <div className="flex justify-evently">
            {user.role.includes("TEACHER") && (
              <AssignDialog
                article={articleResponse.article}
                articleId={params.articleId}
                userId={user.id}
              />
            )}

            {user.role.includes("SYSTEM") && (
              <div className="flex gap-4">
                <ArticleActions
                  article={articleResponse.article}
                  articleId={params.articleId}
                />
              </div>
            )}
            <WordList
              article={articleResponse.article}
              articleId={params.articleId}
              userId={user.id}
            />
          </div>

          <MCQuestionCard userId={user.id} articleId={params.articleId} />
          <SAQuestionCard userId={user.id} articleId={params.articleId} />
          <LAQuestionCard
            userId={user.id}
            articleId={params.articleId}
            userLevel={user.level}
          />
        </div>
      </div>
      <ChatBotFloatingChatButton
        article={articleResponse?.article as Article}
      />
    </>
  );
}
