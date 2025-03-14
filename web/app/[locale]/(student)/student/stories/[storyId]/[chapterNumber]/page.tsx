import StoryChapterCard from "@/components/stories-chapter-card";
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
import StoryMCQuestionCard from "@/components/stories-chapter-question/mc-question-card";
import StorySAQuestionCard from "@/components/stories-chapter-question/sa-question-card";
import StoryLAQuestionCard from "@/components/stories-chapter-question/laq-question-card";

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

  if (storyResponse.message)
    return <CustomError message={storyResponse.message} resp={storyResponse} />;

  return (
    <>
      <div className="md:flex md:flex-row md:gap-3 md:mb-5">
        <StoryChapterCard
          story={storyResponse}
          storyId={params.storyId}
          userId={user.id}
          chapterNumber={params.chapterNumber}
        />
        <div className="flex flex-col mb-40 md:mb-0 md:basis-2/5 mt-4">
          <div className="flex justify-evently">
            {user.role.includes("teacher") && (
              <AssignDialog
                article={storyResponse}
                articleId={params.storyId}
                userId={user.id}
              />
            )}

            {user.role.includes("system") && (
              <div className="flex gap-4">
                <ArticleActions
                  article={storyResponse}
                  articleId={params.storyId}
                />
              </div>
            )}
            <WordList
              article={storyResponse}
              articleId={params.storyId}
              userId={user.id}
            />
          </div>

          <StoryMCQuestionCard
            userId={user.id}
            storyId={storyResponse.storyId}
            articleTitle={storyResponse.chapter.title}
            articleLevel={storyResponse.ra_Level}
            chapterNumber={storyResponse.chapterNumber}
          />
          <StorySAQuestionCard
            userId={user.id}
            storyId={params.storyId}
            articleTitle={storyResponse.chapter.title}
            articleLevel={storyResponse.ra_Level}
            chapterNumber={storyResponse.chapterNumber}
          />
          <StoryLAQuestionCard
            userId={user.id}
            storyId={params.storyId}
            userLevel={user.level}
            articleTitle={storyResponse.chapter.title}
            articleLevel={storyResponse.ra_Level}
            chapterNumber={storyResponse.chapterNumber}
          />
        </div>
      </div>
    </>
  );
}
