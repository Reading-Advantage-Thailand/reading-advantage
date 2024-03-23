/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import React, { useEffect, useState } from "react";
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
import { Header } from "../header";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { updateScore } from "@/lib/utils";
import { Sentence } from "./types";
import QuoteList from "./quote-list";
import { Icons } from "../icons";
import { splitTextIntoSentences } from "@/lib/utils";
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

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);

      // step 1 : find Article sentence: ID and SN due date expired
      const closest = res.data.sentences.filter(
        (item: Sentence, index: number) => {
          // วันที่ต้องการเปรียบเทียบ
          const dayjsItemDate = dayjs(item.due).utc();
          const dayjsNow = dayjs(new Date()).utc();

          // ตรวจสอบว่าเป็นวันเดียวกันหรือไม่
          const isSameDay = dayjs(dayjsItemDate).isSame(dayjsNow, "day");

          // ตรวจสอบว่าใกล้ถึงวันครบกำหนด (วันที่เปรียบเทียบห่างจากวันปัจจุบันไม่เกินหนึ่งวัน)
          const isDueSoon =
            dayjsNow.isSameOrBefore(dayjsItemDate) &&
            dayjsItemDate.isSameOrBefore(dayjsNow.add(1, "day"));

          return isDueSoon || isSameDay;
        }
      );

      // step 2 : create map articleId และ Array ของ sn
      const articleIdToSnMap: { [key: string]: number[] } = closest.reduce(
        (acc: { [key: string]: number[] }, article: Sentence) => {
          if (!acc[article.articleId]) {
            acc[article.articleId] = [article.sn];
          } else {
            acc[article.articleId].push(article.sn);
          }
          return acc;
        },
        {}
      );

      // step 3 : เรียงลำดับค่า sn สำหรับแต่ละ articleId
      for (const articleId in articleIdToSnMap) {
        articleIdToSnMap[articleId].sort((a, b) => a - b);
      }

      // step 4 : get sentence from articleId and sn
      const newTodos = [...articleBeforeRandom];
      for (const articleId in articleIdToSnMap) {
        let resultList = await getArticle(
          articleId,
          articleIdToSnMap[articleId]
        );

        newTodos.push(resultList);
      }

      setArticleBeforeRandom(flatten(newTodos));
      setArticleRandom(flatten(shuffleArray(newTodos)));
    } catch (error) {
      console.log(error);
    }
  };

  const getArticle = async (articleId: string, sn: number[]) => {
    const res = await axios.get(`/api/articles/${articleId}`);
    const textList = await splitTextIntoSentences(res.data.article.content);

    const dataSplit = sn.map((index) => {
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
        title: res.data.article.title,
        surroundingSentences: result,
        articleId,
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

       // ตรวจสอบความถูกต้องของลำดับ
      //  const isCorrectOrder = checkOrder(
      //    updatedArticleRandom[currentArticleIndex].surroundingSentences,
      //    articleBeforeRandom[currentArticleIndex].surroundingSentences
      //  );

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
        const updateScrore = await updateScore(15, userId);
        if (updateScrore?.status === 201) {
          toast({
            title: t("toast.success"),
            description: tUpdateScore("yourXp", { xp: 5 }),
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
        description: t("OrderSentencesPractice.errorOrder"),
        variant: "destructive",
      });
    }
    setLoading(false);
    
  };

  return (
    <>
      <Header
        heading={t("OrderSentencesPractice.OrderSentences")}
        text={t("OrderSentencesPractice.OrderSentencesDescription")}
      />
      <div className="mt-5">
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
            <>
              {articleRandom.length !== currentArticleIndex ? (
                <DragDropContext
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                >
                  <div className="bg-[#2684FFß] flex max-w-screen-lg">
                    <div className="flex flex-col h-full w-screen overflow-auto  bg-[#DEEBFF] dark:text-white dark:bg-[#1E293B]">
                      <div className="flex justify-between items-center">
                        <h4 className="py-4 pl-5">
                          {articleRandom[currentArticleIndex]?.title}
                        </h4>
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
                              src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${articleRandom[currentArticleIndex]?.articleId}.mp3`}
                            />
                          </audio>
                        </div>
                      </div>

                      <QuoteList
                        listId={"list"}
                        quotes={
                          articleRandom[currentArticleIndex]
                            ?.surroundingSentences
                        }
                        sectionIndex={currentArticleIndex}
                        title={articleRandom[currentArticleIndex]?.title}
                        articleBeforeRandom = {articleBeforeRandom[currentArticleIndex]?.surroundingSentences}
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
                  {t("OrderSentencesPractice.saveOrder")}
                </Button>
              ) : (
                <Button
                  className="mt-4"
                  variant="outline"
                  disabled={true}
                  size="sm"
                  onClick={onNextArticle}
                >
                  {t("OrderSentencesPractice.saveOrder")}
                </Button>
              )} 
            </>
          </>
        )}
      </div>
    </>
  );
}
