"use client";SelectStory
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
import { articleShowcaseType } from "@/types";
import { useCurrentLocale } from "@/locales/client";
import { Skeleton } from "./ui/skeleton";
import StoryShowcaseCard from "./stories-showcase-card";

type Props = {
  user: {
    level: number;
    name: string;
    id: string;
  };
};

async function fetchStories(params: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/stories?${params}`
  );
  const data = await response.json();
  return data;
}

export default function SelectStory({ user }: Props) {
  const t = useScopedI18n("components.select");
  const ta = useScopedI18n("components.article");
  const locale = useCurrentLocale();
  const tf: string | any = useScopedI18n("selectType.types");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasMore, setHasMore] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const [articleGenresData, setArticleGenresData] = React.useState<string[]>(
    []
  );
  const [subgenres, setSubgenres] = React.useState<string[]>([]);
  const [articleShowcaseData, setArticleShowcaseData] = React.useState<
    articleShowcaseType[]
  >([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const observer = React.useRef<IntersectionObserver | null>(null);

  const selectedGenre = searchParams.get("genre");
  const selectedSubgenre = searchParams.get("subgenre");

  function getArticleCategory() {
    if (!selectedGenre && !selectedSubgenre) return "genre";
    if (selectedGenre && !selectedSubgenre) return "subGenre";
    return "article";
  }

  async function handleButtonClick(value: string) {
    const params = new URLSearchParams(window.location.search);

    if (!params.has("genre")) {
      params.set("genre", value);
    } else if (!params.has("subgenre")) {
      params.set("subgenre", value);
    }

    // Reset state before navigation
    setPage(1);
    setHasMore(true);
    setArticleShowcaseData([]);
    setLoading(true);

    router.push("?" + params.toString(), { scroll: false });
  }

  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    setArticleShowcaseData([]);
  }, [selectedGenre, selectedSubgenre]);

  React.useEffect(() => {
    async function fetchData() {
      if (!hasMore) return;

      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        params.set("page", page.toString());
        params.set("limit", "8");

        //console.log("Fetching stories with params:", params.toString());
        const response = await fetchStories(params.toString());
        //console.log("API Response:", response);

        if (page === 1) {
          setArticleShowcaseData(response.results);
          // Get unique subgenres from stories
          if (selectedGenre && !selectedSubgenre) {
            const uniqueSubgenres = Array.from(
              new Set(response.results.map((story: any) => story.subgenre))
            ) as string[];
            setSubgenres(uniqueSubgenres);
          }
        } else {
          setArticleShowcaseData((prev) => [...prev, ...response.results]);
        }

        setTotalPages(response.totalPages);
        if (page >= response.totalPages) {
          setHasMore(false);
        }

        setArticleGenresData(response.selectionGenres);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedGenre, selectedSubgenre, page, hasMore]);

  const lastArticleRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore || page >= totalPages) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, totalPages]
  );

  return (
    <Card id="onborda-articles" className="my-2">
      <CardHeader>
        <CardTitle>
          {t("articleChoose", {
            article: <b>{ta(getArticleCategory())}</b>,
          })}
        </CardTitle>
        <CardDescription>
          {t("articleChooseDescription", {
            level: <b>{user.level}</b>,
            article: <b>{ta(getArticleCategory())}</b>,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && page === 1 ? (
          <div className="grid sm:grid-cols-2 grid-flow-row gap-4 mt-4">
            {Array.from({ length: 8 }).map((_: unknown, index: number) => (
              <Skeleton key={index} className="h-80 w-full" />
            ))}
          </div>
        ) : selectedGenre && !selectedSubgenre ? (
          <>
            <div className="flex flex-wrap gap-2">
              {subgenres.map((subgenre) => (
                <Button
                  key={subgenre}
                  onClick={() => handleButtonClick(subgenre)}
                  disabled={loading}
                >
                  {tf(subgenre)}
                </Button>
              ))}
            </div>
            {articleShowcaseData.length > 0 ? (
              <div className="grid sm:grid-cols-2 grid-flow-row gap-4 mt-4">
                {articleShowcaseData.map((article, index) => {
                  const isLastArticle =
                    index === articleShowcaseData.length - 1;
                  return (
                    <StoryShowcaseCard
                      ref={isLastArticle ? lastArticleRef : null}
                      key={article.id}
                      story={article}
                      userId={user.id}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center w-full mt-4">
                <p className="text-gray-500 text-lg">
                  There are no stories in this category.
                </p>
              </div>
            )}
          </>
        ) : selectedGenre && selectedSubgenre ? (
          articleShowcaseData.length > 0 ? (
            <div className="grid sm:grid-cols-2 grid-flow-row gap-4 mt-4">
              {articleShowcaseData.map((article, index) => {
                const isLastArticle = index === articleShowcaseData.length - 1;
                return (
                  <StoryShowcaseCard
                    ref={isLastArticle ? lastArticleRef : null}
                    key={article.id}
                    story={article}
                    userId={user.id}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center w-full mt-4">
              <p className="text-gray-500 text-lg">
                There are no articles in this category.
              </p>
            </div>
          )
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {articleGenresData.map((genre, index) => (
                <Button
                  key={index}
                  onClick={() => handleButtonClick(genre)}
                  disabled={loading}
                >
                  {tf(genre)}
                </Button>
              ))}
            </div>
            {articleShowcaseData.length > 0 ? (
              <div className="grid sm:grid-cols-2 grid-flow-row gap-4 mt-4">
                {articleShowcaseData.map((article, index) => {
                  const isLastArticle =
                    index === articleShowcaseData.length - 1;
                  return (
                    <StoryShowcaseCard
                      ref={isLastArticle ? lastArticleRef : null}
                      key={article.id}
                      story={article}
                      userId={user.id}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center w-full mt-4">
                <p className="text-gray-500 text-lg">
                  There are no articles in this category.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
