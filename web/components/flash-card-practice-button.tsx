"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./ui/button";
import { useScopedI18n } from "@/locales/client";
const fsrsJs = require("fsrs.js");

type Props = {
  index: number;
  nextCard: Function;
};

export default function FlashCardPracticeButton({ index, nextCard }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  let fsrs = new fsrsJs.FSRS();
  let card = new fsrsJs.Card();
  let state = fsrsJs.State;
  let now = new Date();
  console.log("card :>> ", card);
  console.log("fsrs.p :>> ", fsrs.p);
//   let scheduling_cards = fsrs.repeat(card, now);
//   console.log("scheduling_cards :>> ", scheduling_cards);


  return (
    <div className="flex space-x-2">
      <button
        className={cn(
          buttonVariants({ size: "sm" }),
          "bg-red-500",
          "hover:bg-red-600"
        )}
        onClick={() => {
          console.log(index);
          nextCard();
        }}
      >
        {t("flashcardPractice.buttonVeryHard")}
      </button>
      <button
        className={cn(
          buttonVariants({ size: "sm" }),
          "bg-amber-500",
          "hover:bg-amber-600"
        )}
        onClick={() => {
          console.log(index);
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
          console.log(index);
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
          console.log(index);
          nextCard();
        }}
      >
        {t("flashcardPractice.buttonEasy")}
      </button>
    </div>
  );
}