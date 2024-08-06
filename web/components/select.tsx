"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useScopedI18n } from "@/locales/client";
import ArticleShowcaseCard from "./article-showcase-card";
import { articleShowcaseType } from "@/types";

import axios from "axios";
import { useCurrentLocale } from "@/locales/client";

// async function getTranslate(
//  sentences: string[],
//  articleId: string,
//  language: string
// ) {
//  const res = await axios.post(`/api/articles/${articleId}/translate/google`, {
//    sentences,
//    language,
//  });
//  return res.data;
// }

type Props = {
  user: {
    level: number;
    name: string;
    id: string;
  };
};

async function fetchArticles(params: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/articles?${params}`
  );
  console.log(response);

  const data = await response.json();
  return data;
}

export default function Select({ user }: Props) {
  const t = useScopedI18n("components.select");
  const ta = useScopedI18n("components.article");
  const locale = useCurrentLocale();
  const tf: string | any = useScopedI18n("selectType.types");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = React.useState(false);
  const [articleTypesData, setArticleTypesData] = React.useState<string[]>([]);
  const [articleShowcaseData, setArticleShowcaseData] = React.useState<
    articleShowcaseType[]
  >([]);

  const selectedType = searchParams.get("type");
  const selectedGenre = searchParams.get("genre");
  const selectedSubgenre = searchParams.get("subgenre");

  function getArticleType() {
    if (!selectedType && !selectedGenre && !selectedSubgenre) return "type";
    if (selectedType && !selectedGenre && !selectedSubgenre) return "genre";
    if (selectedType && selectedGenre && !selectedSubgenre) return "subGenre";
    return "article";
  }

  async function handleButtonClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!selectedType && !selectedGenre && !selectedSubgenre) {
      params.set("type", value);
    }
    if (selectedType && !selectedGenre && !selectedSubgenre) {
      params.set("genre", value);
    }
    if (selectedType && selectedGenre && !selectedSubgenre) {
      params.set("subgenre", value);
    }
    router.push("?" + params.toString());
  }

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      console.log(searchParams.toString());
      const response = await fetchArticles(searchParams.toString());
      console.log(response);
      if (response.results.length === 0) {
        router.push("?");
      }

      setArticleShowcaseData(response.results);
      setArticleTypesData(response.selectionType);
      setLoading(false);
    }
    fetchData();
  }, [searchParams, router, selectedGenre, selectedSubgenre, selectedType]);

  return (
    <Card className="my-2">
      <CardHeader>
        <CardTitle>
          {t("articleChoose", {
            article: <b>{ta(getArticleType())}</b>,
          })}
        </CardTitle>
        <CardDescription>
          {t("articleChooseDescription", {
            level: <b>{user.level}</b>,
            article: <b>{ta(getArticleType())}</b>,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedType && selectedGenre && selectedSubgenre ? (
          <div className="grid sm:grid-cols-2 grid-flow-row gap-4 mt-4">
            {articleShowcaseData.map((article, index) => (
              <ArticleShowcaseCard
                key={index}
                article={article}
                userId={user.id}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {articleTypesData.map((type, index) => {
                return (
                  <Button
                    key={index}
                    onClick={() => handleButtonClick(type)}
                    disabled={loading}
                  >
                    {locale == "en"
                      ? type.replace(/_/g, " ")
                      : tf(type.replace(/_/g, " "))}
                  </Button>
                );
              })}
            </div>
            <div className="grid sm:grid-cols-2 grid-flow-row gap-4 mt-4">
              {articleShowcaseData.map((article, index) => (
                <ArticleShowcaseCard
                  key={index}
                  article={article}
                  userId={user.id}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
