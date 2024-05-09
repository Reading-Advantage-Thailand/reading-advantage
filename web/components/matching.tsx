/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useScopedI18n } from "@/locales/client";
import Image from "next/image";
import styled from "@emotion/styled";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Header } from "./header";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { updateScore } from "@/lib/utils";
import { Sentence } from "./dnd/types";
import AudioButton from "./audio-button";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

type Props = {
  userId: string;
};

export default function Matching({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );
  const router = useRouter();
  const [articleMatching, setArticleMatching] = useState<any[]>([]);
  const [articleBeforeRandom, setArticleBeforeRandom] = useState<any[]>([]);
  const [articleRandom, setArticleRandom] = useState<any[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [showButtonNextPassage, setShowButtonNextPassage] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);

      // step 1 : sort Article sentence: ID and SN due date expired
      const matching = res.data.sentences.sort((a: Sentence, b: Sentence) => {
        return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
      });

      const newTodos = [...articleMatching];
      const data = [...articleBeforeRandom];
      for (const article of matching) {
        newTodos.push({
          [article?.id]: {
            id: article?.id,
            articleId: article?.articleId,
            timepoint: article?.timepoint,
            endTimepoint: article?.endTimepoint,
            sentenceEn: article?.sentence,
            sentenceTh: article?.translation?.th
          },
        });
        data.push(article?.sentence, article?.translation?.th);
      }
      setArticleMatching(newTodos);
      setArticleBeforeRandom(data);
      setArticleRandom(swapWordPositions(data));
    } catch (error) {
      console.log(error);
    }
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

  // action card
  const handleCardClick = (index: number) => {
    // We will handle it later
  };


  console.log("🚀 ~ Matching ~ articleMatching:", articleMatching);
  console.log("🚀 ~ Matching ~ articleBeforeRandom:", articleBeforeRandom);
  console.log("🚀 ~ Matching ~ articleRandom:", articleRandom);

  return (
    <>
      <Header
        heading={t("matchingPractice.matching")}
        text={t("matchingPractice.matchingDescription")}
      />
      <div className="mt-10">
        {articleRandom.length === 0 ? (
          <>
            <div className="grid w-full gap-10">
              <div className="mx-auto w-[800px] space-y-6">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[20px] w-2/3" />
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-full" />
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
