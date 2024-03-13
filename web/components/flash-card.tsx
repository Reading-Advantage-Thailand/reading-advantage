/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { FlashcardArray } from "react-quizlet-flashcard";
import axios from "axios";
import AudioButton from "./audio-button";
import FlashCardPracticeButton from "./flash-card-practice-button";
import FlipCardPracticeButton from "./flip-card-button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { formatDate, updateScore } from "@/lib/utils";
import { Header } from "./header";
import { toast } from "./ui/use-toast";
import { useScopedI18n } from "@/locales/client";
import { v4 as uuidv4 } from "uuid";
import { date_scheduler, State } from "ts-fsrs";
import { filter } from "lodash";

type Props = {
  userId: string;
  showButton: boolean
  setShowButton: Function
};

export type Sentence = {
  articleId: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  endTimepoint: number;
  sentence: string;
  sn: number;
  timepoint: number;
  translation: { th: string };
  userId: string;
  id: string;
  due: Date; // Date when the card is next due for review
  stability: number; // A measure of how well the information is retained
  difficulty: number; // Reflects the inherent difficulty of the card content
  elapsed_days: number; // Days since the card was last reviewed
  scheduled_days: number; // The interval at which the card is next scheduled
  reps: number; // Total number of times the card has been reviewed
  lapses: number; // Times the card was forgotten or remembered incorrectly
  state: State; // The current state of the card (New, Learning, Review, Relearning)
  last_review?: Date; // The most recent review date, if applicable
};

export default function FlashCard({ userId, showButton, setShowButton }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const controlRef = useRef<any>({});
  const currentCardFlipRef = useRef<any>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);

      const startOfDay = date_scheduler(new Date(), 0, true);
      const filteredData = await res.data.sentences.filter(
        (record: Sentence) => {
          const dueDate = new Date(record.due);
          return (
            record.state === 0 ||
            (record.state === 2 && dueDate < startOfDay) ||
            (record.state === 3 && dueDate < startOfDay)
          );        
        }
      );

      setSentences(filteredData);

      if(filteredData.length === 0) {
        setShowButton(false);
      }

      // updateScore
      let filterDataUpdateScore = await filter(res.data.sentences, (param) => {
        const dueDate = new Date(param.due);
        return (param.state === 2 || param.state === 3) && dueDate < startOfDay;
      });

      if (filterDataUpdateScore?.length > 0) {
        for (let i = 0; i < filterDataUpdateScore.length; i++) {
          try {
            if (!filterDataUpdateScore[i]?.update_score) {
              const updateDatabase = await axios.post(
                `/api/ts-fsrs-test/${filterDataUpdateScore[i]?.id}/flash-card`,
                { ...filterDataUpdateScore[i], update_score: true }
              );
              const updateScrore = await updateScore(15, userId);

              if (updateScrore?.status === 201) {
                toast({
                  title: t("toast.success"),
                  description: tUpdateScore("yourXp", { xp: 15 }),
                });
              }
            }
          } catch (error) {
            console.error(`Failed to update data`);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await axios.delete(`/api/users/${userId}/sentences`, {
        data: {
          sentenceId: id,
        },
      });
      getUserSentenceSaved();
      toast({
        title: t("toast.success"),
        description: t("toast.successDescription"),
      });
    } catch (error) {
      console.log(error);
      toast({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    }
  };

  const cards = sentences.map((sentence, index) => {
    return {
      id: index,
      frontHTML: (
        <div className="flex p-4 text-2xl font-bold text-center justify-center items-center h-full dark:bg-accent dark:rounded-lg dark:text-muted-foreground">
          {sentence.sentence}
        </div>
      ),
      backHTML: (
        <div className="flex p-4 text-2xl font-bold text-center justify-center items-center h-full dark:bg-accent dark:rounded-lg dark:text-muted-foreground">
          {sentence.translation.th}
        </div>
      ),
    };
  });

  return (
    <>
      <Header heading={t("flashcard")} text={t("flashcardDescription")} />
      <div className="flex flex-col items-center justify-center space-y-2 mt-4">
        {sentences.length != 0 && (
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
            {sentences.map((sentence, index) => {
              if (index === currentCardIndex) {
                return (
                  <div className="flex space-x-3" key={uuidv4()}>
                    <AudioButton
                      key={sentence.id}
                      audioUrl={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${sentence.articleId}.mp3`}
                      startTimestamp={sentence.timepoint}
                      endTimestamp={sentence.endTimepoint}
                    />
                    <FlipCardPracticeButton
                      currentCard={() => currentCardFlipRef.current()}
                    />
                  </div>
                );
              }
            })}
          </>
        )}
        {sentences.length != 0 && (
          <FlashCardPracticeButton
            index={currentCardIndex}
            nextCard={() => controlRef.current.nextCard()}
            sentences={sentences}
            showButton={showButton}
            setShowButton={setShowButton}
          />
        )}
      </div>

      <Card className="col-span-3 mt-4 mb-10">
        <CardHeader>
          <CardTitle>{t("savedSentences")}</CardTitle>
          <CardDescription>
            {sentences.length == 0
              ? t("noSavedSentences")
              : t("savedSentencesDescription", {
                  total: sentences.length,
                })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sentences.length != 0 &&
            sentences.map((sentence, index) => {
              return (
                <div
                  key={sentence.id}
                  className="-mx-4 flex items-center rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer gap-3"
                >
                  <Link href={`/student/read/${sentence.articleId}`}>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {sentence.sentence}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("added", {
                          date: formatDate(sentence.createdAt),
                        })}
                      </p>
                    </div>
                  </Link>
                  <Button
                    className="ml-auto font-medium"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(sentence.id)}
                  >
                    {t("deleteButton")}
                  </Button>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </>
  );
}
