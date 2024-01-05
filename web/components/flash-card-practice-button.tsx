"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./ui/button";
import { useScopedI18n } from "@/locales/client";

type Props = {
  index: number;
  nextCard: Function;
};

export default function FlashCardPracticeButton({ index, nextCard }: Props) {
  const t = useScopedI18n("pages.student.practicePage");

  return (
    <div className="flex space-x-2">
      <button
        className={cn(buttonVariants({ size: "sm" }))}
        onClick={() => {
          console.log(index);
          nextCard()
        }}
      >
        {t("flashcardPractice.buttonVeryHard")}
      </button>
      <button
        className={cn(buttonVariants({ size: "sm" }))}
        onClick={() => {
          console.log(index);
          nextCard();
        }}
      >
        {t("flashcardPractice.buttonHard")}
      </button>
      <button
        className={cn(buttonVariants({ size: "sm" }))}
        onClick={() => {
          console.log(index);
          nextCard();
        }}
      >
        {t("flashcardPractice.buttonGood")}
      </button>
      <button
        className={cn(buttonVariants({ size: "sm" }))}
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