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
import { useCurrentLocale } from "@/locales/client";

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
  console.log("API Response:", response);
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
  const [page, setPage] = React.useState(1);
  const observer = React.useRef<IntersectionObserver | null>(null);

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
    console.log(params.toString());
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
    setPage(1);
  }, [searchParams]);
  
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
  
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      params.set("limit", "10");
  
      const response = await fetchArticles(params.toString());
      console.log("API Response:", response);
  
      if (response.results.length === 0 && page === 1) {
        router.push("?");
      }
  
      setArticleShowcaseData((prev) =>
        page === 1 ? response.results : [...prev, ...response.results]
      );
  
      setArticleTypesData(response.selectionType);
      setLoading(false);
    }
  
    fetchData();
  }, [searchParams, page]);
  
  
  const lastArticleRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  return (
    <Card id="onborda-articles" className="my-2">
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
                    {tf(type)}
                  </Button>
                );
              })}
            </div>
            <div className="grid sm:grid-cols-2 grid-flow-row gap-4 mt-4">
              {articleShowcaseData.map((article, index) => {
                const isLastArticle = index === articleShowcaseData.length - 1;
                return (
                  <ArticleShowcaseCard
                    ref={isLastArticle ? lastArticleRef : null}
                    key={article.id}
                    article={article}
                    userId={user.id}
                  />
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
