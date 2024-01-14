"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./ui/button";
import { useScopedI18n } from "@/locales/client";
import { Sentence } from "@/components/flash-card";
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
} from "ts-fsrs";

type Props = {
  index: number;
  nextCard: Function;
  sentences: Sentence[];
};

export default function FlashCardPracticeButton({
  index,
  nextCard,
  sentences,
}: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const params = generatorParameters({ enable_fuzz: true });
  let now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    4,
    0,
    0,
    0
  );
  let card: Card = createEmptyCard();
  const f: FSRS = fsrs(params);
  let scheduling_cards: RecordLog = f.repeat(card, startOfDay);

  const handleClickFsrs = async (index: number, level: string) => {
    if (level === "Again") {
      scheduling_cards[Rating.Again].card;
      scheduling_cards[Rating.Again].log;
    } else if (level === "Hard") {
      scheduling_cards[Rating.Hard].card;
      scheduling_cards[Rating.Hard].log;
    } else if (level === "Good") {
      scheduling_cards[Rating.Good].card;
      scheduling_cards[Rating.Good].log;
    } else if (level === "Easy") {
      scheduling_cards[Rating.Easy].card;
      scheduling_cards[Rating.Easy].log;
    }
    // console.log("sentences :>> ", sentences[index]);
    // scheduling_cards[Rating.Again].card
    // scheduling_cards[Rating.Again].log;
    // console.log("scheduling_cards :>> ", scheduling_cards);
    Grades.forEach((grade) => {
      // [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]
      const { log, card } = scheduling_cards[grade];
      console.group(`${Rating[grade]}`);
      console.table({
        [`card_${Rating[grade]}`]: {
          ...card,
          due: formatDate(card.due),
          last_review: formatDate(card.last_review as Date),
        },
      });
      console.table({
        [`log_${Rating[grade]}`]: {
          ...log,
          review: formatDate(log.review),
        },
      });
      console.groupEnd();
      console.log(
        "----------------------------------------------------------------"
      );
    });
  };

  return (
    <div className="flex space-x-2">
      <p>{State.Learning}</p><br/>
      <button
        className={cn(
          buttonVariants({ size: "sm" }),
          "bg-red-500",
          "hover:bg-red-600"
        )}
        onClick={() => {
          handleClickFsrs(index, "Again");
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
          handleClickFsrs(index, "Hard");
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
          handleClickFsrs(index, "Good");
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
          handleClickFsrs(index, "Easy");
          nextCard();
        }}
      >
        {t("flashcardPractice.buttonEasy")}
      </button>
    </div>
  );
}
