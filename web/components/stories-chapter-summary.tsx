"use client";
import React from "react";
import { useCurrentLocale } from "@/locales/client";
import { StoryChapter } from "./models/article-model";
import { number } from "zod";

type Props = {
  story: StoryChapter;
  storyId: string;
  chapterNumber: string;
};

async function getTranslate(
  storyId: string,
  targetLanguage: string
): Promise<{ message: string; translated_sentences: string[] }> {
  try {
    const res = await fetch(`/api/v1/assistant/stories-translate/${storyId}`, {
      method: "POST",
      body: JSON.stringify({ type: "chapter", targetLanguage }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { message: "error", translated_sentences: [] };
  }
}

export function ChapterSummary({ story, storyId, chapterNumber }: Props) {
  const [summarySentence, setSummarySentence] = React.useState<string[]>([]);
  const locale = useCurrentLocale();
  const chapterIndex = Number(chapterNumber) - 1;

  React.useEffect(() => {
    handleTranslateSummary();
  }, [story, locale]);

  async function handleTranslateSummary() {
    if (!locale || locale === "en") {
      return;
    }
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

    const res = await getTranslate(storyId, localeTarget);

    setSummarySentence([res.translated_sentences[chapterIndex]]);
  }

  return <>{locale == "en" ? story.chapter.summary : summarySentence}</>;
}
