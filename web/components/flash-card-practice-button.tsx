"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./ui/button";
import { useScopedI18n } from "@/locales/client";

type Props = {
    index: number;

}

export default function FlashCardPracticeButton({index}: Props) {
    const t = useScopedI18n("pages.student.practicePage");

    return (
      <>
        <button
          className={cn(buttonVariants({ size: "sm" }))}
          onClick={() => {
            console.log(index);
          }}
        >
          {t("flashcardPractice.buttonEasy")}
        </button>
        <button
          className={cn(buttonVariants({ size: "sm" }))}
          onClick={() => {
            console.log(index);
          }}
        >
          {t("flashcardPractice.buttonGood")}
        </button>
        <button
          className={cn(buttonVariants({ size: "sm" }))}
          onClick={() => {
            console.log(index);
          }}
        >
          {t("flashcardPractice.buttonHard")}
        </button>
        <button
          className={cn(buttonVariants({ size: "sm" }))}
          onClick={() => {
            console.log(index);
          }}
        >
          {t("flashcardPractice.buttonVeryHard")}
        </button>
      </>
    );

}