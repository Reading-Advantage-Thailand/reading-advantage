"use client";
import React, { useState, useRef } from "react";
import { StoryChapter } from "./models/article-model";
import { cn, splitTextIntoSentences } from "@/lib/utils";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

async function getTranslateSentence(
  storyId: string,
  targetLanguage: string
): Promise<{ message: string; translated_sentences: string[] }> {
  try {
    const res = await fetch(`/api/v1/assistant/translate/${storyId}`, {
      method: "POST",
      body: JSON.stringify({ type: "passage", targetLanguage }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { message: "error", translated_sentences: [] };
  }
}

export default function ChapterContent({
  story,
  chapterNumber,
  className = "",
}: {
  story: StoryChapter;
  chapterNumber: number;
  className?: string;
}) {
  const t = useScopedI18n("components.storyChapterContent");
  const locale = useCurrentLocale();
  const [loading, setLoading] = useState(false);
  const [translate, setTranslate] = useState<string[]>([]);
  const [isTranslate, setIsTranslate] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentences = splitTextIntoSentences(story.chapter.content, true);
  const router = useRouter();
  const chapter = Number(chapterNumber);

  async function handleTranslateSentence() {
    setLoading(true);
    type ExtendedLocale = "th" | "cn" | "tw" | "vi" | "zh-CN" | "zh-TW";
    let targetLanguage: ExtendedLocale = locale as ExtendedLocale;
    switch (locale) {
      case "cn":
        targetLanguage = "zh-CN";
        break;
      case "tw":
        targetLanguage = "zh-TW";
        break;
    }
    const response = await getTranslateSentence(story.storyId, targetLanguage);
    if (response.message === "error") {
      setIsTranslate(false);
      setIsTranslateOpen(false);
      setLoading(false);
      toast({
        title: "Something went wrong.",
        description: "Your sentence was not translated. Please try again.",
        variant: "destructive",
      });
      return;
    } else {
      setTranslate(response.translated_sentences);
      setIsTranslateOpen(!isTranslateOpen);
      setIsTranslate(true);
      setLoading(false);
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center my-2 gap-6 w-full">
        <div className="flex flex-[8] justify-end">
          <Button
            variant="default"
            className="w-full"
            onClick={handlePlayPause}
          >
            {t("openvoicebutton")}
          </Button>
        </div>

        <div className="flex flex-[2] justify-start">
          <Button
            variant="default"
            className="w-full"
            onClick={handleTranslateSentence}
            disabled={loading}
          >
            {loading
              ? "Loading"
              : isTranslate && isTranslateOpen
              ? t("translateButton.close")
              : t("translateButton.open")}
          </Button>
        </div>
      </div>

      <div className="leading-relaxed space-y-4">
        {sentences
          .reduce((acc: string[][], sentence, index) => {
            if (index % 4 === 0) acc.push([]);
            acc[acc.length - 1].push(sentence);
            return acc;
          }, [])
          .map((paragraph, index) => (
            <p
              key={index}
              className="text-muted-foreground hover:text-primary transition-all"
            >
              {paragraph.map((sentence, sentenceIndex) => (
                <span
                  key={sentenceIndex}
                  className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900 rounded-md p-1"
                >
                  {sentence}{" "}
                </span>
              ))}
            </p>
          ))}
      </div>

      {isTranslate && isTranslateOpen && (
        <div className="h-32 md:h-24 flex flex-col justify-between items-center">
          <Separator />
          <p className="text-center text-green-500">{translate.join(" ")}</p>
          <Separator />
        </div>
      )}
      <div className="flex flex-row items-center justify-between mt-5">
        {chapter > 1 && (
          <Button
            variant="default"
            onClick={() =>
              router.push(
                `/${locale}/student/stories/${story.storyId}/${chapter - 1}`
              )
            }
          >
            <ArrowLeftIcon className="mr-2" /> {t("previousChapter")}
          </Button>
        )}
        {chapter < story.totalChapters && (
          <Button
            variant="default"
            onClick={() =>
              router.push(
                `/${locale}/student/stories/${story.storyId}/${chapter + 1}`
              )
            }
          >
            {t("nextChapter")} <ArrowRightIcon className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
