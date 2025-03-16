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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

async function getTranslateSentence(
  storyId: string,
  targetLanguage: string,
  chapterNumber: string
): Promise<{
  message: string;
  translated_sentences: string[];
}> {
  try {
    const res = await fetch(
      `/api/v1/assistant/stories-translate/${storyId}/${chapterNumber}`,
      {
        method: "POST",
        body: JSON.stringify({ type: "content", targetLanguage }),
      }
    );
    const data = await res.json();
    console.log("data", data);
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
  chapterNumber: string;
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
  const [isTranslateClicked, setIsTranslateClicked] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

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
    const response = await getTranslateSentence(
      story.storyId,
      targetLanguage,
      chapterNumber
    );
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

  const renderSentence = (sentence: string, i: number) => {
    return sentence.split("~~").map((line, index, array) => (
      <span key={index}>
        {line}
        {(index !== array.length - 1 || /[.!?]$/.test(line)) && " "}
        {index !== array.length - 1 && <div className="mt-3" />}
      </span>
    ));
  };

  const handleTranslate = async () => {
    if (isTranslate === false) {
      await handleTranslateSentence();
      setIsTranslateClicked(!isTranslateClicked);
    } else {
      setIsTranslateClicked(!isTranslateClicked);
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center my-2 gap-4">
        <div className="flex flex-grow items-center">
          <Button
            variant="default"
            className="w-full"
            onClick={handlePlayPause}
          >
            {t("openvoicebutton")}
          </Button>
        </div>
        <div>
          <Button
            variant="default"
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

      {isTranslate && isTranslateOpen && (
        <div className="h-32 md:h-24 flex flex-col justify-between items-center sticky">
          <Separator />
          {/* กรณีกดเล่นเสียง และกดแปล */}
          {isPlaying === true ? (
            <p className="text-center text-green-500">
              {translate[currentAudioIndex]}
            </p>
          ) : (
            <p className="text-center text-green-500">
              {translate[selectedIndex]}
            </p>
          )}
          <Separator />
        </div>
      )}

      <ContextMenu>
        <ContextMenuTrigger>
          <div className="leading-relaxed">
            {sentences.map((sentence, index) => (
              <span
                key={index}
                className={cn(
                  "cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900 rounded-md p-1",
                  "text-muted-foreground hover:text-primary transition-all",
                  selectedIndex === index && "bg-blue-200 dark:bg-blue-900"
                )}
                onClick={() => setSelectedIndex(index)}
              >
                {renderSentence(sentence, index)}
              </span>
            ))}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {loading ? (
            <ContextMenuItem inset disabled>
              Loading
            </ContextMenuItem>
          ) : (
            <>
              <ContextMenuItem
                inset
                onClick={handleTranslate}
                disabled={loading}
              >
                Translate
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={isTranslateClicked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Translate</AlertDialogTitle>
            <AlertDialogDescription>
              <p>{sentences[selectedIndex]}</p>
              <p className="text-green-500 mt-3">{translate[selectedIndex]}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsTranslateClicked(false)}>
              Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
