"use client";

import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface Chapter {
  title: string;
  summary: string;
  is_read: boolean;
}

interface ChapterListProps {
  locale: string;
  storyId: string;
  chapters: Chapter[];
  translations: {
    chapters: string;
    characters: string;
    previouslyRead: string;
    continueRead: string;
    readChapter: string;
  };
}

export default function ChapterList({
  locale,
  storyId,
  chapters,
  translations,
}: ChapterListProps) {
  const router = useRouter();
  const [chapterSummary, setChapterSummary] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasTranslated, setHasTranslated] = React.useState(false);

  const handleChapterClick = (chapterNumber: number) => {
    router.push(`/${locale}/student/stories/${storyId}/${chapterNumber}`);
  };

  async function getTranslate(
    storyId: string,
    targetLanguage: string
  ): Promise<{ message: string; translated_sentences: string[] }> {
    try {
      const res = await fetch(
        `/api/v1/assistant/stories-translate/${storyId}`,
        {
          method: "POST",
          body: JSON.stringify({ type: "chapter", targetLanguage }),
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { message: "error", translated_sentences: [] };
    }
  }

  React.useEffect(() => {
    const fetchTranslations = async () => {
      if (!locale || locale === "en" || isLoading || hasTranslated) {
        return;
      }

      setIsLoading(true);
      try {
        type ExtendedLocale = "th" | "cn" | "tw" | "vi" | "zh-CN" | "zh-TW";
        let localeTarget: ExtendedLocale = locale as ExtendedLocale;
        switch (locale) {
          case "cn":
            localeTarget = "zh-CN";
            break;
          case "tw":
            localeTarget = "zh-TW";
            break;
        }

        const translatedChapters = await Promise.all(
          chapters.map(async (chapter, index) => {
            const res = await getTranslate(storyId, localeTarget);
            return res.translated_sentences[index];
          })
        );

        setChapterSummary(translatedChapters);
        setHasTranslated(true);
      } catch (error) {
        console.error("Translation error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, [locale, storyId, chapters, isLoading, hasTranslated]);

  return (
    <ScrollArea className="h-full p-2">
      {chapters.map((chapter, index) => (
        <div key={index} className="mb-4">
          <p className="font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {chapter.title}
            {chapter.is_read && (
              <span className="text-green-500">
                <span className="text-gray-500">
                  <span className="text-green-500">
                    {translations.previouslyRead}
                  </span>
                </span>
              </span>
            )}
          </p>
          {isLoading ? (
            <div className="space-y-2 mt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <p className="text-gray-500">
              {chapterSummary[index] || chapter.summary}
            </p>
          )}
          {chapter.is_read ? (
            <div className="flex justify-end items-end">
              <Button
                className="mt-2 justify-end items-end"
                variant="outline"
                onClick={() => handleChapterClick(index + 1)}
              >
                {translations.continueRead} {index + 1}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end items-end">
              <Button
                className="mt-2 ml-auto"
                variant="outline"
                onClick={() => handleChapterClick(index + 1)}
              >
                {translations.readChapter} {index + 1}
              </Button>
            </div>
          )}
          <Separator className="my-2" />
        </div>
      ))}
    </ScrollArea>
  );
}
