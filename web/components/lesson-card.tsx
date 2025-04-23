import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { getScopedI18n } from "@/locales/server";
import { Article } from "./models/article-model";
import { ArticleSummary } from "./article-summary";
import VerticalProgress from "./lesson-progress-bar";
import { Icons } from "@/components/icons";
import { Button } from "./ui/button";

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
  const t = await getScopedI18n("components.articleCard");
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
      <div className="md:flex md:flex-row md:gap-3 md:mb-5">
        <div className="mt-4 md:basis-3/5">
          <Card className="pb-6">
            <CardHeader>
              <CardTitle className="font-bold text-3xl md:text-3xl">
                {article.title}
              </CardTitle>
              <div className="flex flex-wrap gap-3">
                <Badge>
                  {t("raLevel", {
                    raLevel: article.ra_level,
                  })}
                </Badge>
                <Badge>
                  {t("cefrLevel", {
                    cefrLevel: article.cefr_level,
                  })}
                </Badge>
              </div>
              <CardDescription>
                <ArticleSummary article={article} articleId={articleId} />
              </CardDescription>
              <div className="flex justify-center h-[350px] overflow-hidden">
                <Image
                  src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${articleId}.png`}
                  alt="Malcolm X"
                  width={840}
                  height={250}
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <div className="flex items-center gap-4 px-8">
              <Icons.AlertCircle />
              <p className="text-sm leading-loose">
                For language learners: This lesson is designed to take
                approximately 30 to 45 minutes to complete. Each phase within
                the lesson includes a built-in timer that tracks how much time
                is spent on different activities. This timing data will be used
                for learning analytics and may contribute to your overall
                performance score. The time tracking also helps us better
                understand how students interact with different parts of the
                lesson and improve future learning experiences. Please try to
                work through the lesson at a steady pace for the most accurate
                results.
              </p>
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <VerticalProgress currentPhase={2} phases={phases} />
          <Button>{tb("startLesson")}</Button>
        </div>
      </div>
      <div className="md:flex mt-[50px]"></div>
    </div>
  );
}
