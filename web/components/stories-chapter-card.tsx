import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import ChapterContent from "./stories-chapter-content";
import { Badge } from "./ui/badge";
import { getScopedI18n } from "@/locales/server";
import { ArticleFooter } from "./article-footer";
import RatingPopup from "./rating-popup";
import { StoryChapter } from "./models/article-model";
import { ChapterSummary } from "./stories-chapter-summary";

type Props = {
  story: StoryChapter;
  storyId: string;
  userId: string;
  chapterNumber: number;
};

export default async function StoryChapterCard({
  story,
  storyId,
  userId,
  chapterNumber,
}: Props) {
  const t = await getScopedI18n("components.articleCard");
  return (
    <div className="mt-4 md:basis-3/5">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-3xl md:text-3xl">
            {story.chapter.title}
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <Badge>
              {t("raLevel", {
                raLevel: story.ra_Level,
              })}
            </Badge>
            <Badge>
              {t("cefrLevel", {
                cefrLevel: story.cefr_level,
              })}
            </Badge>
          </div>
          <CardDescription>
            <ChapterSummary story={story} storyId={storyId} />
          </CardDescription>
          <div className="flex justify-center">
            <Image
              src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${storyId}-${chapterNumber}.png`}
              alt="Malcolm X"
              width={640}
              height={640}
            />
          </div>
          <ChapterContent story={story} chapterNumber={chapterNumber} />
        </CardHeader>
        <ArticleFooter />
      </Card>
    </div>
  );
}
