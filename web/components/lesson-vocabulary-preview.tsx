"use client";

import { useState, useEffect } from "react";
import { useScopedI18n } from "@/locales/client";
import { Book } from "lucide-react";
import { useCurrentLocale } from "@/locales/client";
import { Article } from "@/components/models/article-model";
import { Skeleton } from "@/components/ui/skeleton";
import { AUDIO_WORDS_URL } from "@/server/constants";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "@/components/ui/use-toast";
import AudioImg from "./audio-img";

interface Props {
  article: Article;
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}

interface WordList {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
  index: number;
  startTime: number;
  endTime: number;
  audioUrl: string;
}

export default function LessonWordList({
  article,
  articleId,
  userId,
  onCompleteChange,
}: Props) {
  const t = useScopedI18n("pages.student.lessonPage");
  const [loading, setLoading] = useState<boolean>(false);
  const [wordList, setWordList] = useState<WordList[]>([]);

  // Get the current locale
  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";

  useEffect(() => {
    onCompleteChange(true);
  }, []);

  useEffect(() => {
    const fetchWordList = async () => {
      try {
        setLoading(true); // Start loading
        const resWordlist = await fetch(`/api/v1/assistant/wordlist`, {
          method: "POST",
          body: JSON.stringify({ article, articleId }),
        });

        const data = await resWordlist.json();

        let wordList = [];

        if (data?.timepoints) {
          wordList = data?.timepoints.map(
            (timepoint: { timeSeconds: number }, index: number) => {
              const startTime = timepoint.timeSeconds;
              const endTime =
                index === data?.timepoints.length - 1
                  ? timepoint.timeSeconds + 10
                  : data?.timepoints[index + 1].timeSeconds;
              return {
                vocabulary: data?.word_list[index]?.vocabulary,
                definition: data?.word_list[index]?.definition,
                index,
                startTime,
                endTime,
                audioUrl: `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/${AUDIO_WORDS_URL}/${articleId}.mp3`,
              };
            }
          );
        } else {
          wordList = data?.word_list;
        }
        setWordList(wordList);
      } catch (error: any) {
        console.error("error: ", error);
        toast({
          title: "Something went wrong.",
          description: `${error?.response?.data?.message || error?.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchWordList();
  }, [article, articleId]);

  const playAudioSegment = (audioUrl: string, start: number, end: number) => {
    const audio = new Audio(audioUrl);
    audio.currentTime = start;

    const onTimeUpdate = () => {
      if (audio.currentTime >= end) {
        audio.pause();
        audio.removeEventListener("timeupdate", onTimeUpdate);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.play();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase2Title")}</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && wordList ? (
          <div className="flex items-start xl:h-[400px] w-full md:w-[725px] xl:w-[710px] space-x-4 mt-5">
            <div className="space-y-8 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : (
          <>
            <div>
              <span className="font-bold">{t("phase2Description")}</span>
            </div>
            <div className="mt-2 space-y-4 max-h-[400px] w-full md:w-[725px] xl:w-[710px] overflow-auto">
              {wordList?.map((word, index) => (
                <div
                  key={index}
                  className="p-4 border-b-2 flex flex-row items-start"
                >
                  <span className="font-bold text-cyan-500 mr-2">
                    {word.vocabulary}:
                  </span>
                  {word?.startTime && (
                    <AudioImg
                      key={word.vocabulary}
                      audioUrl={
                        word.audioUrl
                          ? word.audioUrl
                          : `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/${AUDIO_WORDS_URL}/${articleId}.mp3`
                      }
                      startTimestamp={word?.startTime}
                      endTimestamp={word?.endTime}
                    />
                  )}
                  <span>{word.definition[currentLocale]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
