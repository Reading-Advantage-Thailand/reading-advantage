/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { flatten } from "lodash";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useScopedI18n } from "@/locales/client";
import { Header } from "./header";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { updateScore } from "@/lib/utils";
import { Sentence } from "./dnd/types";
import { Icons } from "./icons";
import AudioButton from "./audio-button";
import { splitTextIntoSentences } from "@/lib/utils";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

type Props = {
  userId: string;
};

export default function OrderWords({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tc = useScopedI18n("components.articleContent");
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isplaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [articleOrderWords, setArticleOrderWords] = useState<any[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [showButtonNextPassage, setShowButtonNextPassage] = useState(false);

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);

      // step 1 : sort Article sentence: ID and SN due date expired
      const closest = res.data.sentences.sort((a: Sentence, b: Sentence) => {
        return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
      });
      console.log("🚀 ~ closest ~ closest:", closest);
      const newTodos = [...articleOrderWords];
      for (const article of closest) {
        let resultList = await getArticle(
          article?.articleId,
          article?.sentence,
          article?.translation?.th
        );
        newTodos.push({
          ...resultList,
          timepoint: article?.timepoint,
          endTimepoint: article?.endTimepoint,
        });
      }
      console.log("🚀 ~ getUserSentenceSaved ~ newTodos:", newTodos);
      setArticleOrderWords(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const getArticle = async (
    articleId: string,
    sentence: string,
    translationTh: string
  ) => {
    // before random
    const textList = sentence.split(" ");

    // after random
    const randomTextList = swapWordPositions(textList);

    return {
      articleId,
      textList,
      randomTextList,
      translationTh,
    };
  };

  const swapWordPositions = (words: any) => {
    const rawData = JSON.parse(JSON.stringify(words));
    if (rawData.length > 1) {
      rawData.forEach((_element: string, index: number) => {
        const j = Math.floor(Math.random() * (index + 1));
        [rawData[index], rawData[j]] = [rawData[j], rawData[index]];
      });
    }

    return rawData;
  };

  //=====> play audio
  const handlePause = () => {
    setIsPlaying(!isplaying);
    if (audioRef.current === null) return;
    if (isplaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  return (
    <>
      <Header
        heading={t("orderWordsPractice.orderWords")}
        text={t("orderWordsPractice.orderWordsDescription")}
      />
      <div className="mt-5">
        {articleOrderWords?.length === 0 ? (
          <div className="grid w-full gap-10">
            <div className="mx-auto w-[800px] space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[20px] w-2/3" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[20px] w-full" />
            </div>
          </div>
        ) : (
          <>
            {articleOrderWords?.length !== currentArticleIndex ? (
              <>
                <div className="bg-[#2684FFß] flex max-w-screen-lg">
                  <div className="flex flex-col h-full w-screen overflow-auto  bg-[#DEEBFF] dark:text-white dark:bg-[#1E293B]">
                    <div className="flex justify-between">
                      <h4 className="py-4 pl-5 font-bold">
                        {t("orderWordsPractice.tryToSortThisSentence")}
                      </h4>
                      <div className="p-3">
                        <AudioButton
                          key={currentArticleIndex}
                          audioUrl={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${articleOrderWords[currentArticleIndex]?.articleId}.mp3`}
                          startTimestamp={
                            articleOrderWords[currentArticleIndex]?.timepoint
                          }
                          endTimestamp={
                            articleOrderWords[currentArticleIndex]?.endTimepoint
                          }
                        />
                       
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </div>{" "}
    </>
  );
}
