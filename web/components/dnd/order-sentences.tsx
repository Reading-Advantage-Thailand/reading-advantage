/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { useScopedI18n } from "@/locales/client";
import { Header } from "../header";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { splitToText, updateScore } from "@/lib/utils";
import { Article, Sentence } from "./types";
import QuoteList from "./quote-list";
import AudioButton from "../audio-button";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
};

export default function OrderSentences({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  let rawArticle: Sentence[] = [];
  const [articleBeforeRandom, setArticleBeforeRandom] = useState<any[]>([]);
  const [articleRandom, setArticleRandom] = useState<any[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );
  const router = useRouter();

  // ฟังก์ชันเพื่อค้นหา text ก่อน, ณ ลำดับนั้น, และหลังลำดับ
  const findTextsByIndexes = (objects: Article[], targetIndexes: number[]) => {
    return targetIndexes.map((index: number) => {
      const before =
        index - 1 >= 0
          ? { index: index - 1, text: objects[index - 1]?.text }
          : null;
      const current = { index: index, text: objects[index]?.text };
      const after =
        index + 1 < objects.length
          ? { index: index + 1, text: objects[index + 1]?.text }
          : null;
      return { before, current, after };
    });
  };

  // สร้างฟังก์ชันเพื่อจัดการข้อมูล
  const processDynamicData = (data: any, title: string) => {
    // ใช้ Map เพื่อจัดการการซ้ำของข้อมูล
    const uniqueTexts = new Map();

    // วนลูปเพื่อดึงข้อมูลจากแต่ละส่วน
    data.forEach((group: any) => {
      // ดึงข้อมูล before, current, after และเพิ่มลงใน Map
      [group?.before, group?.current, group?.after].forEach((item) => {
        if (item !== null) {
          uniqueTexts.set(item?.index, item?.text);
        }
      });
    });

    // แปลง Map เป็น Array และเรียงลำดับตาม index
    return Array.from(uniqueTexts.keys())
      .sort((a, b) => a - b)
      .map((index) => ({
        id: index,
        text: uniqueTexts.get(index),
        articleId: rawArticle?.filter((data: Sentence) => {
          return data?.sentence === uniqueTexts?.get(index);
        })[0]?.articleId,
        timepoint: rawArticle?.filter((data: Sentence) => {
          return data?.sentence === uniqueTexts?.get(index);
        })[0]?.timepoint,
        endTimepoint: rawArticle?.filter((data: Sentence) => {
          return data?.sentence === uniqueTexts?.get(index);
        })[0]?.endTimepoint,
        title,
        result: rawArticle?.filter((data: Sentence) => {
          return data?.sentence === uniqueTexts?.get(index);
        }),
      }));
  };

  const shuffleArray = (data: any) => {
    const rawData = JSON.parse(JSON.stringify(data));

    // Loop through each section in the data
    rawData.forEach((section: any) => {
      // Check if the result array has at least two items to swap
      for (let i = section.result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [section.result[i], section.result[j]] = [
          section.result[j],
          section.result[i],
        ];
      }
    });
    return rawData;
  };

  const getArticle = async (articleId: string, sn: number[]) => {
    const res = await axios.get(`/api/articles/${articleId}`);
    const textList = await splitToText(res.data.article);
    const resultsFindTexts = await findTextsByIndexes(textList, sn);
    const resultsProcess = await processDynamicData(
      resultsFindTexts,
      res.data.article.title
    );

    if (resultsProcess.length > 5) {
      return {
        title: res.data.article.title,
        result: resultsProcess.slice(0, 5),
      };
    } else {
      return { title: res.data.article.title, result: resultsProcess };
    }
  };

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);

      // step 1: get the article id and get sn
      const objectSentence: Sentence[] = res.data.sentences;
      rawArticle = res.data.sentences;

      // step 2 : create map articleId และ Array ของ sn
      const articleIdToSnMap: { [key: string]: number[] } =
        objectSentence.reduce((acc: { [key: string]: number[] }, article) => {
          if (!acc[article.articleId]) {
            acc[article.articleId] = [article.sn];
          } else {
            acc[article.articleId].push(article.sn);
          }
          return acc;
        }, {});

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

      setArticleBeforeRandom(newTodos);
      setArticleRandom(shuffleArray(newTodos));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  // Drag and Drop
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
    const items = articleRandom[currentArticleIndex]?.result
      ? Array.from(articleRandom[currentArticleIndex].result)
      : [];

    // ต่อไปนี้คือการใช้งาน splice โดยตรวจสอบก่อนว่า items ไม่เป็น undefined
    if (items.length > 0) {
      const items = [...articleRandom[currentArticleIndex]?.result];
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // อัปเดตลำดับใหม่หลังจากการดรากและดรอป
      const updatedArticleRandom = [...articleRandom];
      updatedArticleRandom[currentArticleIndex].result = items;

      // ตรวจสอบความถูกต้องของลำดับ
      const isCorrectOrder = checkOrder(
        updatedArticleRandom[currentArticleIndex].result,
        articleBeforeRandom[currentArticleIndex].result
      );

      // อัปเดตสถานะของ articleRandom ด้วยข้อมูลความถูกต้อง
      setArticleRandom(
        updatedArticleRandom.map((article, idx) => {
          if (idx === currentArticleIndex) {
            return {
              ...article,
              result: article.result.map((item: any, itemIdx: number) => ({
                ...item,
                // ตั้งค่า correctOrder ตามผลลัพธ์ของการตรวจสอบ
                correctOrder: isCorrectOrder[itemIdx],
              })),
            };
          }
          return article;
        })
      );
    } else {
      console.log("No items to remove");
    }
  };

  const checkOrder = (randomOrder: any, originalOrder: any) => {
    return randomOrder.map(
      (item: any) =>
        originalOrder.findIndex(
          (originalItem: any) => originalItem.id === item.id
        ) === randomOrder.indexOf(item)
    );
  };

  const onNextArticle = async () => {
    setLoading(true);
    let isEqual = true;

    for (
      let i = 0;
      i < articleBeforeRandom[currentArticleIndex].result.length;
      i++
    ) {
      if (
        articleBeforeRandom[currentArticleIndex].result[i].text !==
        articleRandom[currentArticleIndex].result[i].text
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
            description: tUpdateScore("yourXp", { xp: 15 }),
          });
          setCurrentArticleIndex(currentArticleIndex + 1);
          router.refresh();
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
  /*
            <AudioButton
            key={new Date().getTime()}
            audioUrl={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${quote.articleId}.mp3`}
            startTimestamp={quote?.timepoint || 0}
            endTimestamp={quote?.endTimepoint || 0}
          />
  */

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
            {articleRandom.length !== currentArticleIndex ? (
              <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <div className="bg-[#2684FFß] flex max-w-screen-lg">
                  <div className="flex flex-col h-full w-screen overflow-auto  bg-[#DEEBFF] dark:text-white dark:bg-[#1E293B]">
                    <div className="flex justify-between items-center">
                      <h4 className="py-4 pl-5">
                        {articleRandom[currentArticleIndex]?.title}
                      </h4>
                      <div className="mr-5">                      
                        <AudioButton
                          key={new Date().getTime()}
                          // audioUrl={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${quote.articleId}.mp3`}
                          // startTimestamp={quote?.timepoint || 0}
                          // endTimestamp={quote?.endTimepoint || 0}
                          audioUrl={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios.mp3`}
                          startTimestamp={0}
                          endTimestamp={0}
                        />
                      </div>
                    </div>

                    <QuoteList
                      listId={"list"}
                      quotes={articleRandom[currentArticleIndex]?.result}
                      sectionIndex={currentArticleIndex}
                      title={articleRandom[currentArticleIndex]?.title}
                    />
                  </div>
                </div>
              </DragDropContext>
            ) : (
              <></>
            )}

            {articleRandom.length !== currentArticleIndex ? (
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
        )}
      </div>
    </>
  );
}
