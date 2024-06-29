"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { buttonVariants } from "../ui/button";
import { useScopedI18n } from "@/locales/client";
import { Word } from "./tabs-flash-card";
import {
  createEmptyCard,
  formatDate,
  fsrs,
  generatorParameters,
  Rating,
  Grades,
  Card,
  FSRSParameters,
  FSRS,
  RecordLog,
  State,
  ReviewLog,
} from "ts-fsrs";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";

type Props = {
  index: number;
  nextCard: Function;
  words: Word[];
  showButton: boolean;
  setShowButton: Function;
};

type Logs = {
  rating: Rating;
  state: State;
  due: Date;
  elapsed_days: number;
  scheduled_days: number;
  review: Date;
};

export default function FlashCardVocabularyPracticeButton({
  index,
  nextCard,
  words,
  showButton,
  setShowButton,
}: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const [cards, setCards] = useState<Word[]>(words);
  const [logs, setLogs] = useState<Logs[]>([]);
  const params = generatorParameters();
  const fnFsrs: FSRS = fsrs(params);

  const handleClickFsrs = async (index: number, rating: Rating) => {
    const preCard = cards[index];
    const scheduling_cards: any = fnFsrs.repeat(preCard, preCard.due);

    // set cards by index
    const newCards = [...cards];
    newCards[index] = scheduling_cards[rating].card;
    setCards(newCards);

    // set logs by index
    const newLogs = [...logs];
    newLogs[index] = scheduling_cards[rating].log;
    setLogs(newLogs);

    const response = await axios.post(
      `/api/ts-fsrs-test/${newCards[index].id}/flash-card`,
      {
        ...newCards[index],
        page: "vocabulary",
      }
    );

    if (index + 1 === words.length) {
      setShowButton(false);
    }
  };

  return (
    <>
      {showButton ? (
        words[index].state === 0 ||
        words[index].state === 1 ||
        words[index].state === 2 ||
        words[index].state === 3 ? (
          <div className="flex space-x-2">
            <button
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-red-500",
                "hover:bg-red-600"
              )}
              onClick={() => {
                handleClickFsrs(index, Rating.Again);
                nextCard();
              }}
            >
              {t("flashcardPractice.buttonAgain")}
            </button>
            <button
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-amber-500",
                "hover:bg-amber-600"
              )}
              onClick={() => {
                handleClickFsrs(index, Rating.Hard);
                nextCard();
              }}
            >
              {t("flashcardPractice.buttonHard")}
            </button>
            <button
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-emerald-500",
                "hover:bg-emerald-600"
              )}
              onClick={() => {
                handleClickFsrs(index, Rating.Good);
                nextCard();
              }}
            >
              {t("flashcardPractice.buttonGood")}
            </button>
            <button
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-blue-500",
                "hover:bg-blue-600"
              )}
              onClick={() => {
                handleClickFsrs(index, Rating.Easy);
                nextCard();
              }}
            >
              {t("flashcardPractice.buttonEasy")}
            </button>
          </div>
        ) : (
          <button
            className={cn(buttonVariants({ size: "sm" }))}
            onClick={() => {
              if (index + 1 === words.length) {
                setShowButton(false);
              } else {
                nextCard();
              }
            }}
          >
            {t("flashcardPractice.nextButton")}
          </button>
        )
      ) : (
        <></>
      )}
    </>
  );
}
