"use client";
import React from "react";
import { useCurrentLocale } from "@/locales/client";
import { Article } from "./models/article-model";

type Props = {
  article: Article;
  articleId: string;
};

async function getTranslate(
  articleId: string,
  targetLanguage: string
): Promise<{ message: string; translated_sentences: string[] }> {
  try {
    const res = await fetch(`/api/assistant/translate/${articleId}`, {
      method: "POST",
      body: JSON.stringify({ type: "summary", targetLanguage }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { message: "error", translated_sentences: [] };
  }
}

export function ArticleSummary({ article, articleId }: Props) {
  const [summarySentence, setSummarySentence] = React.useState<string[]>([]);
  const locale = useCurrentLocale();

  React.useEffect(() => {
    handleTranslateSummary();
  }, [article, locale]);

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

    const res = await getTranslate(articleId, localeTarget);

    setSummarySentence(res.translated_sentences);
  }

  return <>{locale == "en" ? article.summary : summarySentence}</>;
}
