/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { flatten } from "lodash";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import Image from "next/image";
import "animate.css";
import { useScopedI18n } from "@/locales/client";
import { Header } from "../header";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Sentence } from "./types";
import QuoteList from "./quote-list";
import { Icons } from "../icons";
import { levelCalculation, splitTextIntoSentences } from "@/lib/utils";
import {
  UserXpEarned,
  ActivityStatus,
  ActivityType,
} from "../models/user-activity-log-model";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

type Props = {
  userId: string;
};

export default function OrderSentences({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tc = useScopedI18n("components.articleContent");
  const router = useRouter();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isplaying, setIsPlaying] = React.useState(false);
  const [articleBeforeRandom, setArticleBeforeRandom] = useState<any[]>([]);
  const [articleRandom, setArticleRandom] = useState<any[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );

  const getUserSentenceSaved = async () => {
    try {
      const res = await fetch(`/api/v1/users/sentences/${userId}`);
      const data = await res.json();

      // Step 1: เรียงตาม due date ใกล้หมดอายุก่อน
      const closest = data.sentences.sort((a: Sentence, b: Sentence) => {
        return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
      });

      const newTodos = [...articleBeforeRandom];

      // Step 2: Loop แต่ละ sentence และเลือกใช้ getArticle หรือ getStories ตามประเภท
      for (const sentence of closest) {
        let resultList = null;

        if (sentence.articleId) {
          resultList = await getArticle(sentence.articleId, sentence.sn);
        } else if (sentence.storyId && sentence.chapterNumber !== undefined) {
          resultList = await getStories(
            sentence.storyId,
            sentence.chapterNumber,
            sentence.sn
          );
        }

        if (resultList) {
          newTodos.push(resultList);
        }
      }

      setArticleBeforeRandom(flatten(newTodos));
      setArticleRandom(flatten(shuffleArray(newTodos)));
    } catch (error) {
      console.error(error);
    }
  };

  const getArticle = async (articleId: string, sn: number) => {
    const res = await fetch(`/api/v1/articles/${articleId}`);
    const data = await res.json();

    const textList = splitTextIntoSentences(data.article.passage);

    const dataSplit = [sn].map((index) => {
      let result: any[] = [];

      // Determine how many sentences can be included above the current index
      let sentencesAbove = index;

      // Determine how many sentences can be included below the current index
      let sentencesBelow = textList.length - index - 1;

      // Calculate m based on available sentences above and below
      let m = Math.min(sentencesAbove, 4);
      let n = 4 - m;

      // If the current index is at or near the end, adjust m and n accordingly
      if (sentencesBelow < n) {
        n = sentencesBelow;
        m = Math.min(4, sentencesAbove + (4 - n));
      }

      let from = Math.max(index - m, 0);
      let to = Math.min(index + n + 1, textList.length);

      // Add the selected range of sentences to the result array
      result = textList.slice(from, to);

      return {
        index: index,
        title: data.article.title,
        surroundingSentences: result,
        articleId,
        timepoint: data.article.timepoints[index].file,
      };
    });

    return dataSplit;
  };

  const getStories = async (
    storyId: string,
    chapterNumber: string,
    sn: number
  ) => {
    const res = await fetch(`/api/v1/stories/${storyId}/${chapterNumber}`);

    const data = await res.json();

    const textList = splitTextIntoSentences(data.chapter.content);

    const dataSplit = [sn].map((index) => {
      let result: any[] = [];

      // Determine how many sentences can be included above the current index
      let sentencesAbove = index;

      // Determine how many sentences can be included below the current index
      let sentencesBelow = textList.length - index - 1;

      // Calculate m based on available sentences above and below
      let m = Math.min(sentencesAbove, 4);
      let n = 4 - m;

      // If the current index is at or near the end, adjust m and n accordingly
      if (sentencesBelow < n) {
        n = sentencesBelow;
        m = Math.min(4, sentencesAbove + (4 - n));
      }

      let from = Math.max(index - m, 0);
      let to = Math.min(index + n + 1, textList.length);

      // Add the selected range of sentences to the result array
      result = textList.slice(from, to);

      return {
        index: index,
        title: data.chapter.title,
        surroundingSentences: result,
        storyId,
        timepoint: data.timepoints[index].file,
      };
    });

    return dataSplit;
  };

  const shuffleArray = (data: any) => {
    const rawData = JSON.parse(JSON.stringify(data));

    // Loop through each section in the data
    rawData?.forEach((title: any) => {
      title.forEach((section: any) => {
        // Check if the result array has at least two items to swap
        if (section.surroundingSentences.length > 1) {
          // Loop through the result array and swap each item with a random item
          for (let i = section.surroundingSentences.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [section.surroundingSentences[i], section.surroundingSentences[j]] =
              [
                section.surroundingSentences[j],
                section.surroundingSentences[i],
              ];
          }
        }
      });
    });
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

  //====> Drag and Drop
  const onDragStart = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    // ตรวจสอบก่อนว่า listArticle มีค่า และ listArticle.result ไม่เป็น undefined
    const items = articleRandom[currentArticleIndex]?.surroundingSentences
      ? Array.from(articleRandom[currentArticleIndex].surroundingSentences)
      : [];

    // ต่อไปนี้คือการใช้งาน splice โดยตรวจสอบก่อนว่า items ไม่เป็น undefined
    if (items.length > 0) {
      const items = [
        ...articleRandom[currentArticleIndex]?.surroundingSentences,
      ];
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // อัปเดตลำดับใหม่หลังจากการดรากและดรอป
      const updatedArticleRandom = [...articleRandom];
      updatedArticleRandom[currentArticleIndex].surroundingSentences = items;

      // อัปเดตสถานะของ articleRandom ด้วยข้อมูลความถูกต้อง
      setArticleRandom(updatedArticleRandom);
    } else {
      toast({
        title: t("toast.error"),
        description: "No items to remove",
        variant: "destructive",
      });
    }
  };

  const onNextArticle = async () => {
    setLoading(true);
    let isEqual = true;

    for (
      let i = 0;
      i < articleBeforeRandom[currentArticleIndex].surroundingSentences.length;
      i++
    ) {
      if (
        articleBeforeRandom[currentArticleIndex].surroundingSentences[i] !==
        articleRandom[currentArticleIndex].surroundingSentences[i]
      ) {
        isEqual = false;
        break;
      }
    }

    if (isEqual) {
      try {
        const updateScrore = await fetch(
          `/api/v1/users/${userId}/activitylog`,
          {
            method: "POST",
            body: JSON.stringify({
              activityType: ActivityType.SentenceOrdering,
              activityStatus: ActivityStatus.Completed,
              xpEarned: UserXpEarned.Sentence_Ordering,
              details: {
                cefr_level: levelCalculation(UserXpEarned.Sentence_Ordering)
                  .cefrLevel,
              },
            }),
          }
        );
        if (updateScrore?.status === 200) {
          toast({
            title: t("toast.success"),
            imgSrc: true,
            description: tUpdateScore("yourXp", {
              xp: UserXpEarned.Sentence_Ordering,
            }),
          });
          setCurrentArticleIndex(currentArticleIndex + 1);
          router.refresh();
          setIsPlaying(false);
        }
      } catch (error) {
        toast({
          title: t("toast.error"),
          description: t("toast.errorDescription"),
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: t("toast.error"),
        description: t("orderSentencesPractice.errorOrder"),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  return (
    <>
      <Header
        heading={t("orderSentencesPractice.orderSentences")}
        text={t("orderSentencesPractice.orderSentencesDescription")}
      />
      <div className="flex flex-col items-center justify-center space-y-2 mt-4">
        {articleRandom.length === 0 ? (
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
            {articleRandom.length !== currentArticleIndex ? (
              <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <div className="bg-[#2684FFß] flex max-w-screen-lg">
                  <div className="flex flex-col h-full overflow-auto  bg-[#DEEBFF] dark:text-white dark:bg-[#1E293B]">
                    <div className="flex justify-between items-center">
                      <div className="p-5">
                        <Image
                          src={"/knight.svg"}
                          alt="Man"
                          width={92}
                          height={115}
                          className="animate__animated animate__backInLeft"
                          title="Drag the sentences to reorder them!"
                        />
                      </div>

                      <span className="py-4 pr-5 font-bold">
                        {articleRandom[currentArticleIndex]?.title}
                      </span>
                      <div className="mr-5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handlePause}
                        >
                          {isplaying ? (
                            <Icons.pause className="mr-1" size={12} />
                          ) : (
                            <Icons.play className="mr-1" size={12} />
                          )}
                          {isplaying
                            ? tc("soundButton.pause")
                            : tc("soundButton.play")}
                        </Button>
                        <audio
                          ref={audioRef}
                          key={
                            articleRandom[currentArticleIndex]
                              ?.surroundingSentences
                          }
                        >
                          <source
                            src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/tts/${
                              articleRandom[currentArticleIndex]?.timepoint ??
                              `${articleRandom[currentArticleIndex]?.articleId}.mp3`
                            }`}
                          />
                        </audio>
                      </div>
                    </div>

                    <QuoteList
                      listId={"list"}
                      quotes={
                        articleRandom[currentArticleIndex]?.surroundingSentences
                      }
                      sectionIndex={currentArticleIndex}
                      title={articleRandom[currentArticleIndex]?.title}
                      articleBeforeRandom={
                        articleBeforeRandom[currentArticleIndex]
                          ?.surroundingSentences
                      }
                    />
                  </div>
                </div>
              </DragDropContext>
            ) : (
              <></>
            )}

            {articleRandom.length != currentArticleIndex ? (
              <Button
                className="mt-4"
                variant="outline"
                disabled={loading}
                size="sm"
                onClick={onNextArticle}
              >
                {t("orderSentencesPractice.saveOrder")}
              </Button>
            ) : (
              <div className="flex flex-wrap justify-center mt-10 ">
                <Image
                  src={"/winners.svg"}
                  alt="winners"
                  width={250}
                  height={100}
                  className="animate__animated animate__jackInTheBox"
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
