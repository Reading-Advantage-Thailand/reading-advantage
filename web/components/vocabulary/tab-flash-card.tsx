/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { FlashcardArray } from "react-quizlet-flashcard";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { v4 as uuidv4 } from "uuid";
import { date_scheduler, State } from "ts-fsrs";
import { filter } from "lodash";
import { useRouter } from "next/navigation";
import { ReloadIcon } from "@radix-ui/react-icons";

import { Button } from "../ui/button";
import { updateScore } from "@/lib/utils";
import { Header } from "../header";
import { toast } from "../ui/use-toast";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import FlashCardVocabularyPracticeButton from "./flash-card-vocabulary-practice-button";
import FlipCardPracticeButton from "../flip-card-button";
import { Timestamp } from "firebase/firestore";
import { levelCalculation } from "@/lib/utils";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

type Props = {
  userId: string;
  showButton: boolean;
  setShowButton: Function;
  userXP: number;
  userLevel: number;
};

export type Word = {
  articleId: string;
  createdAt?: { _seconds: number; _nanoseconds: number };
  difficulty: number; // Reflects the inherent difficulty of the card content
  due: Date; // Date when the card is next due for review
  elapsed_days: number; // Days since the card was last reviewed
  lapses: number; // Times the card was forgotten or remembered incorrectly
  reps: number; // Total number of times the card has been reviewed
  scheduled_days: number; // The interval at which the card is next scheduled
  stability: number; // A measure of how well the information is retained
  state: State; // The current state of the card (New, Learning, Review, Relearning)
  userId: string;
  word: {
    vocabulary: string;
    definition: {
      en: string;
      th: string;
      cn: string;
      tw: string;
      vi: string;
    };
    sn: number;
    timepoint: number;
  };
  id?: string;
  last_review?: Date; // The most recent review date, if applicable
};

export default function FlashCard({
  userId,
  showButton,
  setShowButton,
  userXP,
  userLevel,
}: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );
  const tWordList = useScopedI18n("components.wordList");
  const router = useRouter();
  const controlRef = useRef<any>({});
  const currentCardFlipRef = useRef<any>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<Word[]>([]);

  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";
  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/word-list/${userId}`);
      const startOfDay = date_scheduler(new Date(), 0, true);
      const filteredData = await res?.data?.word
        .filter((record: Word) => {
          const dueDate = new Date(record.due);
          return record.state === 0 || dueDate < startOfDay;
        })
        .sort((a: Word, b: Word) => {
          return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
        });

      setWords(filteredData);

      if (filteredData.length === 0) {
        setShowButton(false);
      }

      // updateScore

      let filterDataUpdateScore = await filter(res.data.sentences, (param) => {
        const dueDate = new Date(param.due);
        const state = param.state || 0; // Assign a default value of 0 if param.state is undefined or falsy
        return (state === 2 || state === 3) && dueDate < startOfDay;
      });

      if (filterDataUpdateScore?.length > 0) {
        for (let i = 0; i < filterDataUpdateScore.length; i++) {
          try {
            if (!filterDataUpdateScore[i]?.update_score) {
              const updateDatabase = await axios.post(
                `/api/ts-fsrs-test/${filterDataUpdateScore[i]?.id}/flash-card`,
                {
                  ...filterDataUpdateScore[i],
                  update_score: true,
                  page: "vocabulary",
                }
              );
              // const updateScrore = await updateScore(15, userId);
              const updateScrore = await fetch(
                `/api/v1/users/${userId}/activitylog`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    articleId: "",
                    activityType: "vocabulary_flashcards",
                    activityStatus: "completed",
                    xpEarned: 15,
                    initialXp: userXP,
                    finalXp: userXP + 15,
                    initialLevel: userLevel,
                    finalLevel: levelCalculation(userXP + 15).raLevel,
                    details: {
                      ...filterDataUpdateScore[i],
                    },
                  }),
                }
              );
              if (updateScrore?.status === 200) {
                toast({
                  title: t("toast.success"),
                  description: tUpdateScore("yourXp", { xp: 15 }),
                });
                router.refresh();
              }
            }
          } catch (error) {
            console.error(`Failed to update data`);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Your word was not saved. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cards = words.map((word, index) => {
    return {
      id: index,
      frontHTML: (
        <div className="flex p-4 text-2xl font-bold text-center justify-center items-center h-full dark:bg-accent dark:rounded-lg dark:text-muted-foreground">
          {word.word.vocabulary}
        </div>
      ),
      backHTML: (
        <div className="flex p-4 text-2xl font-bold text-center justify-center items-center h-full dark:bg-accent dark:rounded-lg dark:text-muted-foreground">
          {word.word.definition[currentLocale]}
        </div>
      ),
    };
  });

  const handleDeleteAll = async () => {
    let idWord = words.map((word) => word.id);
    try {
      setLoading(true);
      // loop for delete all words
      for (let i = 0; i < idWord.length; i++) {
        const res = await axios.delete(`/api/word-list/${userId}`, {
          data: {
            idWord: idWord[i],
          },
        });

        if (i === idWord.length - 1) {
          setLoading(false);
          getUserSentenceSaved();
          toast({
            title: t("toast.success"),
            description: t("toast.successDescription"),
          });
        }
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  return (
    <>
      <div className="mt-5">
        <Header
          heading={tWordList("tab.flashcard")}
          text={tWordList("flashcard.description")}
        />
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 mt-4">
        {words.length != 0 && (
          <>
            <FlashcardArray
              cards={cards}
              controls={false}
              showCount={false}
              onCardChange={(index) => {
                setCurrentCardIndex(index);
              }}
              forwardRef={controlRef}
              currentCardFlipRef={currentCardFlipRef}
            />
            <div className="flex flex-row justify-center items-center">
              <p className="mx-4 my-4 font-medium">
                {currentCardIndex + 1} / {cards.length}
              </p>
            </div>
            {words.map((_, index) => {
              if (index === currentCardIndex) {
                return (
                  <div className="flex space-x-3" key={uuidv4()}>
                    <FlipCardPracticeButton
                      currentCard={() => currentCardFlipRef.current()}
                    />
                  </div>
                );
              }
            })}
          </>
        )}
        {words.length != 0 && (
          <>
            <FlashCardVocabularyPracticeButton
              index={currentCardIndex}
              nextCard={() => controlRef.current.nextCard()}
              words={words}
              showButton={showButton}
              setShowButton={setShowButton}
            />
            <div>
              {loading ? (
                <Button className="ml-auto font-medium" disabled>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  {tWordList("flashcard.neverPracticeButton")}
                </Button>
              ) : (
                <Button
                  className="ml-auto font-medium"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteAll()}
                >
                  {tWordList("flashcard.neverPracticeButton")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
