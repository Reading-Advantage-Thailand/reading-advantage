import React from "react";

import { getScopedI18n } from "@/locales/server";
import { Article } from "./models/article-model";
import { TimerProvider } from "@/contexts/timer-context";
import VerticalProgress from "./lesson-progress-bar";

import { Header } from "./header";

type Props = {
  article: Article;
  articleId: string;
  userId: string;
};

export default async function LessonCard({
  article,
  articleId,
  userId,
}: Props) {
  const tb = await getScopedI18n("pages.student.lessonPage");
  const phaseKeys = [
    "phases.0",
    "phases.1",
    "phases.2",
    "phases.3",
    "phases.4",
    "phases.5",
    "phases.6",
    "phases.7",
    "phases.8",
    "phases.9",
    "phases.10",
    "phases.11",
    "phases.12",
    "phases.13",
  ] as const;

  const phases = phaseKeys.map((key) => tb(key));
  return (
    <div>
      <div>
        <div className=" md:basis-3/5">
          <Header heading={tb("lesson")} text={article.title} />
        </div>
        <div className="flex flex-col gap-4">
          <TimerProvider>
            <VerticalProgress
              phases={phases}
              article={article}
              articleId={articleId}
              userId={userId}
            />
          </TimerProvider>
        </div>
      </div>
      <div className="md:flex mt-[50px]"></div>
    </div>
  );
}
