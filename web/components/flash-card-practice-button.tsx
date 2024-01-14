"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./ui/button";
import { useScopedI18n } from "@/locales/client";
import {Sentence} from '@/components/flash-card'
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
} from "ts-fsrs";


type Props = {
  index: number;
  nextCard: Function;
  sentences: Sentence[];
};

export default function FlashCardPracticeButton({ index, nextCard, sentences }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
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
  
  // let now = new Date();
  // const params: FSRSParameters = generatorParameters({
  //   maximum_interval: 1000,
  // });
  // let card: Card = createEmptyCard();
  // const f: FSRS = fsrs(params);
  // let scheduling_cards: RecordLog = f.repeat(card, new Date());


  const handleClickFsrs = async (index: number, level:string) => {
    // console.log("sentences :>> ", sentences[index]);
    // scheduling_cards[Rating.Again].card
    // scheduling_cards[Rating.Again].log;
    // console.log("scheduling_cards :>> ", scheduling_cards);
    
  };

  return (
    <div className="flex space-x-2">
      <button
        className={cn(
          buttonVariants({ size: "sm" }),
          "bg-red-500",
          "hover:bg-red-600"
        )}
        onClick={() => {
          handleClickFsrs(index, 'Again');
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
          handleClickFsrs(index,'Hard');
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
          handleClickFsrs(index,'Good');
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
          handleClickFsrs(index,'Easy');
          nextCard();
        }}
      >
        {t("flashcardPractice.buttonEasy")}
      </button>
    </div>
  );
}