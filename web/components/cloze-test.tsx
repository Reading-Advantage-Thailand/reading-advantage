/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { before, flatten, random, join } from "lodash";
import subtlex from "subtlex-word-frequencies";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import styled from "@emotion/styled";
import { Header } from "./header";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { updateScore } from "@/lib/utils";
import { Icons } from "./icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { splitTextIntoSentences } from "@/lib/utils";
import { Sentence } from "./dnd/types";
import { wordFrequenciesConfig } from "@/constants/word-frequencies";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

type Props = {
  userId: string;
};

type RootObject = {
  textArrayId: number;
  resultTextArray?: ResultTextArray[] | null;
};
type SubtlexResult = {
  word: string;
  count: number;
};
type ResultTextArray = {
  subtlexResult: SubtlexResult;
  indexWord: number;
};

type TextArraySplit = {
  id: number;
  textSplit: string[];
};

export default function ClozeTest({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tc = useScopedI18n("components.articleContent");
  const router = useRouter();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isplaying, setIsPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [articleClozeTest, setArticleClozeTest] = useState<any[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = React.useState(0);

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

      const newTodos = [...articleClozeTest];

      // step 2 : เรียงลำดับค่า sn สำหรับแต่ละ articleId
      for (const article of closest) {
        let resultList = await getArticle(article?.articleId, article?.sn);
        newTodos.push(resultList);
      }

      setArticleClozeTest(flatten(newTodos));
    } catch (error) {
      console.log(error);
    }
  };

  const getArticle = async (articleId: string, sn: number) => {
    const res = await axios.get(`/api/articles/${articleId}`);
    const textList = await splitTextIntoSentences(res.data.article.content);

    // step 3 : find data split text, text count max level, position text max level, position text for show and replace dropdown
    const dataSplit = [sn].map((index) => {
      let result: string[] = [];

      // กำหนดว่าสามารถรวมประโยคได้กี่ประโยคเหนือ index ปัจจุบัน;
      let sentencesAbove = index;

      // กำหนดว่าสามารถรวมประโยคได้กี่ประโยคใต้ index ปัจจุบัน;
      let sentencesBelow = textList.length - index - 1;

      // คำนวณ m ตามจำนวนประโยคที่มีอยู่ด้านบนและด้านล่าง
      let m = Math.min(sentencesAbove, 4);
      let n = 4 - m;

      // ถ้าดัชนีปัจจุบันอยู่ที่หรือใกล้กับตอนท้ายแล้ว ให้ปรับ m และ n ตามที่เหมาะสม
      if (sentencesBelow < n) {
        n = sentencesBelow;
        m = Math.min(4, sentencesAbove + (4 - n));
      }

      let from = Math.max(index - m, 0);
      let to = Math.min(index + n + 1, textList.length);

      // เพิ่มช่วงของประโยคที่เลือกไปยังอาร์เรย์ผลลัพธ์
      result = textList.slice(from, to);

      // แบ่งประโยคออกเป็นคำ
      const textArraySplit = result.map((text, index) => {
        return {
          id: index,
          textSplit: text.split(" "),
        };
      });

      // สร้างอาร์เรย์ของคำที่จะใช้แทนที่ โดยเลือกคำที่มีความถี่สูงสุด
      const textCountSplit = textArraySplit?.map((textArray) => {
        // ใช้ map ที่นี่เพื่อ return อาร์เรย์ของผลลัพธ์จากการประมวลผลแต่ละคำ
        const resultTextArray = textArray?.textSplit?.map(
          (word: string, index) => {
            let wordReplace = word.replace(/(?<!\w)'|'(?!\w)|[?.",!]+/g, "");

            // คำนวณความถี่ของคำ
            const result: any = subtlex?.filter(
              ({ word }) => word === wordReplace.toLowerCase()
            )[0];

            return {
              subtlexResult: result,
              indexWord: index,
            };
          }
        );
        return { textArrayId: textArray.id, resultTextArray };
      });
      const minCountByList = textCountSplit && findMinimumCount(textCountSplit);

      return {
        title: res.data.article.title,
        surroundingSentences: result,
        index,
        articleId,
        textArraySplit, // คำในแต่ละประโยคที่มีการแยกออกมา
        beforeRandomWords: minCountByList, // คำในแต่ละประโยคที่มีความถี่ต่ำสุด
        randomWords: swapWordPositions(minCountByList), // คำในแต่ละประโยคที่มีการสลับตำแหน่ง
      };
    });
    return dataSplit;
  };

  const findMinimumCount = (data: any) => {
    const results: any = [];
    data?.forEach((group: RootObject) => {
      let minCount = Number.MAX_SAFE_INTEGER;
      let secondMinCount = Number.MAX_SAFE_INTEGER;
      let minWord = {};
      let secondMinWord = {};

      group?.resultTextArray?.forEach((wordInfo: ResultTextArray) => {
        // Ensure subtlexResult and count are defined before using them
        if (
          wordInfo?.subtlexResult &&
          wordInfo.subtlexResult.hasOwnProperty("count")
        ) {
          const count = wordInfo.subtlexResult.count;
          if (count < minCount) {
            secondMinCount = minCount;
            secondMinWord = minWord;
            minCount = count;
            minWord = wordInfo;
          } else if (count < secondMinCount && count !== minCount) {
            secondMinCount = count;
            secondMinWord = wordInfo;
          }
        }
      });

      // Check for duplicates results words
      const countDuplicates =
        results &&
        results.filter(
          (wordInfo: any) =>
            wordInfo?.subtlexResult &&
            wordInfo.subtlexResult.hasOwnProperty("count") &&
            wordInfo.subtlexResult.count === minCount
        ).length;

      if (countDuplicates && countDuplicates > 0 && secondMinWord) {
        results.push({ ...secondMinWord, correctWords: false }); // Use the second minimum if the first is duplicated
      } else if (minWord) {
        results.push({ ...minWord, correctWords: false }); // Otherwise, use the first minimum
      }
    });

    return results;
  };

  const swapWordPositions = (words: any) => {
    const rawData = JSON.parse(JSON.stringify(words));
    if (rawData.length > 1) {
      rawData.forEach((_element: ResultTextArray, index: number) => {
        const j = Math.floor(Math.random() * (index + 1));
        [rawData[index], rawData[j]] = [rawData[j], rawData[index]];
      });
    }

    return rawData;
  };

  const Content = styled.div`
    /* flex child */
    flex-grow: 1;

    flex-basis: 100%;

    /* flex parent */
    display: flex;
    flex-direction: column;
  `;

  const Footer = styled.div`
    display: flex;
    margin-top: 8px;
    justify-content: flex-end;
  `;

  const Badges = styled.small`
    margin-right: 10px;
  `;

  const dropdownWords = (indexTextArraySplit: number) => {
    const listRandomWords = JSON.parse(JSON.stringify(articleClozeTest));
    return (
      <Select
        onValueChange={(e) => {
          let value: any = JSON.parse(e);

          console.log("value : ", value);

          const isCorrect =
            articleClozeTest[currentArticleIndex].beforeRandomWords[
              indexTextArraySplit
            ].subtlexResult.word === value.obj.subtlexResult.word;

          console.log("🚀 ~ dropdownWords ~ isCorrect:", isCorrect);
          let updatedArticleClozeTest = [...articleClozeTest];
          updatedArticleClozeTest[currentArticleIndex].randomWords[
            indexTextArraySplit
          ].correctWords = isCorrect;
          console.log(
            "🚀 ~ dropdownWords ~ updatedArticleClozeTest:",
            updatedArticleClozeTest
          );

          // setArticleClozeTest(updatedArticleClozeTest);
        }}
      >
        <SelectTrigger className="w-[150px] my-2">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {listRandomWords[currentArticleIndex]?.randomWords?.map(
            (obj: ResultTextArray, index: number) => {
              return (
                <SelectItem
                  key={index}
                  value={JSON.stringify({
                    obj: obj,
                    indexRow: indexTextArraySplit,
                  })}
                >
                  {obj.subtlexResult.word}
                </SelectItem>
              );
            }
          )}
        </SelectContent>
      </Select>
    );
  };

  console.log("🚀 ~ ClozeTest ~ articleClozeTest:", articleClozeTest);

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

  const onNextArticle = async () => {
    setLoading(true);
    setCurrentArticleIndex((prev) => prev + 1);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Header
        heading={t("ClozeTestPractice.ClozeTest")}
        text={t("ClozeTestPractice.ClozeTestDescription")}
      />
      <div className="mt-5">
        {articleClozeTest.length === 0 ? (
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
            {articleClozeTest.length !== currentArticleIndex ? (
              <>
                <div className="bg-[#2684FFß] flex max-w-screen-lg">
                  <div className="flex flex-col h-full w-screen overflow-auto  bg-[#DEEBFF] dark:text-white dark:bg-[#1E293B]">
                    <div className="flex justify-between items-center">
                      <h4 className="py-4 pl-5 font-bold">
                        {articleClozeTest[currentArticleIndex]?.title}
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
                            articleClozeTest[currentArticleIndex]
                              ?.surroundingSentences
                          }
                        >
                          <source
                            src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${articleClozeTest[currentArticleIndex]?.articleId}.mp3`}
                          />
                        </audio>
                      </div>
                    </div>

                    {/* show sentences */}
                    <div className="p-5 bg-[#EBECF0]">
                      {articleClozeTest[
                        currentArticleIndex
                      ]?.textArraySplit.map(
                        (
                          element: TextArraySplit,
                          indexTextArraySplit: number
                        ) => {
                          return (
                            <div
                              key={indexTextArraySplit}
                              className="bg-white rounded-lg border-solid shadow-transparent box-border p-8 min-h-10 mb-8  select-none color-[#091e42]"
                            >
                              <Content>
                                <p>
                                  {element.textSplit.map(
                                    (word: string, index: number) => {
                                      // Check if the current word's index matches any indexWord from beforeRandomWords
                                      const shouldReplace =
                                        articleClozeTest[currentArticleIndex]
                                          .beforeRandomWords[element.id]
                                          .indexWord === index;

                                      // If it matches, replace with 'XXX', otherwise keep the original word
                                      return (
                                        <span
                                          key={index}
                                          className={
                                            shouldReplace ? "text-blue-500" : ""
                                          }
                                        >
                                          {/* {shouldReplace ? "XXX" : word}{" "} */}
                                          {shouldReplace
                                            ? dropdownWords(indexTextArraySplit)
                                            : word}{" "}
                                        </span>
                                      );
                                    }
                                  )}
                                </p>
                                <Footer>
                                  {articleClozeTest[currentArticleIndex]
                                    .randomWords[element.id].correctWords ? (
                                    <Badges>
                                      <Image
                                        src={"/correct.png"}
                                        alt="Malcolm X"
                                        width={25}
                                        height={25}
                                      />
                                    </Badges>
                                  ) : (
                                    <Badges>
                                      <Image
                                        src={"/wrong.png"}
                                        alt="Malcolm X"
                                        width={25}
                                        height={25}
                                      />
                                    </Badges>
                                  )}
                                </Footer>
                              </Content>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
            {articleClozeTest.length !== currentArticleIndex ? (
              <>
                {loading ? (
                  <Button className="mt-4" disabled>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    {t("OrderSentencesPractice.saveOrder")}
                  </Button>
                ) : (
                  <Button
                    className="mt-4"
                    variant="outline"
                    disabled={loading}
                    size="sm"
                    onClick={onNextArticle}
                  >
                    {t("OrderSentencesPractice.saveOrder")}
                  </Button>
                )}

                {/* loading button for update xp */}
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </>
  );
}
