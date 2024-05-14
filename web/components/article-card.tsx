import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import ArticleContent from "./article-content";
import { Badge } from "./ui/badge";
import { getScopedI18n } from "@/locales/server";
import { ArticleFooter } from "./article-footer";
import RatingPopup from "./rating-popup";
import { Article } from "./models/article-model";
import { ArticleSummary } from "./article-summary";

type Props = {
  article: Article;
  articleId: string;
  userId: string;
};

export default async function ArticleCard({
  article,
  articleId,
  userId,
}: Props) {
  const t = await getScopedI18n("components.articleCard");
  return (
    <div className="mt-4 md:basis-3/5">
      <Card>
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
          <div className="flex justify-center">
            <Image
              src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${articleId}.png`}
              alt="Malcolm X"
              width={640}
              height={640}
            />
          </div>
          <ArticleContent
            article={article}
            articleId={articleId}
            userId={userId}
          />
        </CardHeader>
        <ArticleFooter />
      </Card>

      <RatingPopup
        userId={userId}
        averageRating={article.average_rating}
        articleId={articleId}
      />
      {/* part question */}
      {/* {(article.questions && ( */}
      {/* <Questions
          className="flex flex-col mt-4 mb-40 md:mb-0 md:basis-2/5"
          questions={article.questions}
          articleId={articleId}
          userId={userId}
          articleTitle={article.title}
        /> */}
      {/* )) || (
        
      <Card className="flex flex-col mt-4 mb-40 md:mb-0 md:basis-2/5">
        <CardHeader>
          <CardTitle>Generating Questions</CardTitle>
          <CardDescription>
            Generating questions for this article. Please wait a moment.
          </CardDescription>
          <Skeleton className="h-[80px] w-full my-3" />
          <Skeleton className="h-[40px] w-full mb-3" />
          <Skeleton className="h-[20px] w-full mb-3" />
          <Skeleton className="h-[70px] w-full mb-3" />
        </CardHeader>
      </Card>
      )} */}
    </div>
  );
}
