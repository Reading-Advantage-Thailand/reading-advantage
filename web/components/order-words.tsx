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
import "animate.css";
import { Header } from "./header";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { Sentence } from "./dnd/types";
import AudioButton from "./audio-button";
import {
  UserXpEarned,
  ActivityStatus,
  ActivityType,
} from "./models/user-activity-log-model";
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
  const [loading, setLoading] = useState(false);
  const [articleOrderWords, setArticleOrderWords] = useState<any[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [resultOrderWords, setResultOrderWords] = useState(false);
  const [showButtonNextPassage, setShowButtonNextPassage] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  const getUserSentenceSaved = async () => {
    try {
      const res = await fetch(`/api/v1/users/sentences/${userId}`);
      const data = await res.json();

      // step 1 : sort Article sentence: ID and SN due date expired
      const closest = data.sentences.sort((a: Sentence, b: Sentence) => {
        return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
      });

      const newTodos = [...articleOrderWords];

      for (const article of closest) {
        let resultList = await getArticle(
          article?.articleId,
          article?.sentence,
          article?.translation?.th,
          article?.audioUrl
        );
        newTodos.push({
          ...resultList,
          timepoint: article?.timepoint,
          endTimepoint: article?.endTimepoint,
          audioUrl: article?.audioUrl,
        });
      }

      setArticleOrderWords(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const getArticle = async (
    articleId: string,
    sentence: string,
    translationTh: string,
    audioUrl: string
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
      audioUrl,
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

  const Badges = styled.small`
    margin-right: 10px;
  `;

  const onSubmitOrderWords = async () => {
    const numbersEqual =
      articleOrderWords[currentArticleIndex]?.textList.length ===
        selectedAnswers.length &&
      selectedAnswers.every(
        (i) =>
          articleOrderWords[currentArticleIndex]?.randomTextList[
            selectedAnswers[i]
          ] === articleOrderWords[currentArticleIndex]?.textList[i]
      );

    setResultOrderWords(numbersEqual);
    setShowButtonNextPassage(numbersEqual);
    setShowBadges(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const onNextPassage = async () => {
    if (resultOrderWords) {
      try {
        const updateScrore = await fetch(
          `/api/v1/users/${userId}/activitylog`,
          {
            method: "POST",
            body: JSON.stringify({
              activityType: ActivityType.SentenceWordOrdering,
              activityStatus: ActivityStatus.Completed,
              xpEarned: UserXpEarned.Sentence_Word_Ordering,
            }),
          }
        );
        if (updateScrore?.status === 200) {
          router.refresh();
          toast({
            title: t("toast.success"),
            imgSrc: true,
            description: tUpdateScore("yourXp", {
              xp: UserXpEarned.Sentence_Word_Ordering,
            }),
          });
          setLoading(false);
          setShowBadges(false);
          setCurrentArticleIndex((prev) => prev + 1);
          setShowButtonNextPassage(false);
          setSelectedAnswers([]);
        }
      } catch (error) {
        toast({
          title: t("toast.error"),
          description: t("toast.errorDescription"),
          variant: "destructive",
        });
      }
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
                <div className="flex grow flex-col gap-5">
                  <h4 className="my-5 text-2xl font-bold sm:text-3xl flex justify-center">
                    {t("orderWordsPractice.tryToSortThisSentence")}
                  </h4>
                  <div className="w-full">
                    <div className="flex justify-center gap-2 px-2 mb-5">
                      <Image
                        src={"/man-mage-light.svg"}
                        alt="Man"
                        width={92}
                        height={115}
                        className="animate__animated animate__tada"
                      />
                      <div className="relative ml-2 w-fit rounded-2xl border-2 border-gray-200 p-4">
                        {articleOrderWords[currentArticleIndex]?.translationTh}
                        <div className="pt-3">
                          <AudioButton
                            key={currentArticleIndex}
                            audioUrl={`${articleOrderWords[currentArticleIndex]?.audioUrl}`}
                            startTimestamp={
                              articleOrderWords[currentArticleIndex]?.timepoint
                            }
                            endTimestamp={
                              articleOrderWords[currentArticleIndex]
                                ?.endTimepoint
                            }
                          />
                        </div>
                        <div
                          className="absolute h-4 w-4 rotate-45 border-b-2 border-l-2 border-gray-200 bg-white dark:bg-[#020817]"
                          style={{
                            top: "calc(50% - 8px)",
                            left: "-10px",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex min-h-[60px] flex-wrap gap-1 border-b-2 border-t-2 border-gray-200 py-1">
                      {selectedAnswers.map((i) => {
                        return (
                          <button
                            key={i}
                            className="rounded-2xl border-2 border-b-4 border-gray-200 p-2 "
                            onClick={() => {
                              setShowBadges(false);
                              setShowButtonNextPassage(false);
                              setSelectedAnswers((selectedAnswers) => {
                                return selectedAnswers.filter((x) => x !== i);
                              });
                            }}
                          >
                            {
                              articleOrderWords[currentArticleIndex]
                                ?.randomTextList[i]
                            }
                          </button>
                        );
                      })}
                      <div className="flex items-center">
                        {showBadges ? (
                          <>
                            {resultOrderWords ? (
                              <>
                                <Badges>
                                  <Image
                                    src={"/correct.png"}
                                    alt="Malcolm X"
                                    width={25}
                                    height={25}
                                  />
                                </Badges>
                              </>
                            ) : (
                              <>
                                <Badges>
                                  <Image
                                    src={"/wrong.png"}
                                    alt="Malcolm X"
                                    width={25}
                                    height={25}
                                  />
                                </Badges>
                              </>
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {articleOrderWords[currentArticleIndex]?.randomTextList.map(
                      (word: string, i: number) => {
                        return (
                          <button
                            key={i}
                            className={
                              selectedAnswers.includes(i)
                                ? "rounded-2xl border-2 border-b-4 border-gray-200 bg-gray-200 p-2 text-gray-200"
                                : "rounded-2xl border-2 border-b-4 border-gray-200 p-2 "
                            }
                            disabled={selectedAnswers.includes(i)}
                            onClick={() => {
                              setShowBadges(false);
                              setShowButtonNextPassage(false);
                              setSelectedAnswers((selectedAnswers) => {
                                if (selectedAnswers.includes(i)) {
                                  return selectedAnswers;
                                }
                                return [...selectedAnswers, i];
                              });
                            }}
                          >
                            {word}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}

            {articleOrderWords.length !== currentArticleIndex ? (
              <>
                {loading ? (
                  <Button className="mt-4" disabled>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    {t("orderWordsPractice.saveOrder")}
                  </Button>
                ) : (
                  <>
                    {selectedAnswers.length ===
                      articleOrderWords[currentArticleIndex]?.randomTextList
                        .length && (
                      <Button
                        className="mt-4"
                        variant="outline"
                        disabled={loading}
                        size="sm"
                        onClick={onSubmitOrderWords}
                      >
                        {t("orderWordsPractice.submitArticle")}
                      </Button>
                    )}

                    {showButtonNextPassage && (
                      <Button
                        className="mt-4 ml-4"
                        variant="secondary"
                        size="sm"
                        onClick={onNextPassage}
                      >
                        {t("orderWordsPractice.nextPassage")}
                      </Button>
                    )}
                  </>
                )}
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
