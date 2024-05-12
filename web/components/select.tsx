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
import { Skeleton } from "./ui/skeleton";

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

  const data = await response.json();
  return data;
}

export default function Select({ user }: Props) {
  const t = useScopedI18n("components.select");
  const ta = useScopedI18n("components.article");
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
      const response = await fetchArticles(searchParams.toString());

      if (response.results.length === 0) {
        router.push("?");
      }
      if (selectedType && selectedGenre && selectedSubgenre) {
        setArticleShowcaseData(response.results);
      } else {
        setArticleTypesData(response.results);
      }
      setLoading(false);
    }
    fetchData();
  }, [searchParams]);

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
          <div className="grid sm:grid-cols-2 grid-flow-row gap-4">
            {articleShowcaseData.map((article, index) => (
              <ArticleShowcaseCard key={index} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {articleTypesData.map((type, index) => (
              <Button
                key={index}
                onClick={() => handleButtonClick(type)}
                disabled={loading}
              >
                {type.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
