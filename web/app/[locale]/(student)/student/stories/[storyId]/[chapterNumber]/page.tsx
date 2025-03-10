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

export const metadata = {
  title: "Story",
  description: "Story",
};

async function getStoryChapter(storyId: string, chapterNumber: number) {
  return fetchData(`/api/v1/stories/${storyId}/${chapterNumber}`);
}

export default async function ArticleQuizPage({
  params,
}: {
  params: { storyId: string; chapterNumber: number };
}) {
  const t = await getScopedI18n("pages.student.storyPage.story");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

  const storyResponse = await getStoryChapter(
    params.storyId,
    params.chapterNumber
  );

  console.log(storyResponse);

  if (storyResponse.message)
    return <CustomError message={storyResponse.message} resp={storyResponse} />;

  return (
    <>
      <div className="md:flex md:flex-row md:gap-3 md:mb-5">
        <ArticleCard
          article={storyResponse.result.content}
          articleId={params.storyId}
          userId={user.id}
        />
        <div className="flex flex-col mb-40 md:mb-0 md:basis-2/5 mt-4">
          <div className="flex justify-evently">
            {user.role.includes("teacher") && (
              <AssignDialog
                article={storyResponse.result.content}
                articleId={params.storyId}
                userId={user.id}
              />
            )}

            {user.role.includes("system") && (
              <div className="flex gap-4">
                <ArticleActions
                  article={storyResponse.result.content}
                  articleId={params.storyId}
                />
              </div>
            )}
            <WordList
              article={storyResponse.result.title}
              articleId={params.storyId}
              userId={user.id}
            />
          </div>

          <MCQuestionCard
            userId={user.id}
            articleId={params.storyId}
            articleTitle={storyResponse.result.title}
            articleLevel={storyResponse.result.chapterNumber}
          />
          <SAQuestionCard
            userId={user.id}
            articleId={params.storyId}
            articleTitle={storyResponse.result.title}
            articleLevel={storyResponse.result.chapterNumber}
          />
          <LAQuestionCard
            userId={user.id}
            articleId={params.storyId}
            userLevel={user.level}
            articleTitle={storyResponse.result.title}
            articleLevel={storyResponse.result.chapterNumber}
          />
        </div>
      </div>
      <ChatBotFloatingChatButton article={storyResponse?.article as Article} />
    </>
  );
}
