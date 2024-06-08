"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import axios from "axios";
import { useScopedI18n } from "@/locales/client";
import { Book } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useCurrentLocale } from "@/locales/client";
import { Article } from "@/components/models/article-model";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
interface Props {
  article?: Article;
}

interface WordList {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
}

export default function WordList({ article }: Props) {
  const t = useScopedI18n("components.wordList");

  // Get the current locale
  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";

  const wordSample = [
    {
      vocabulary: "variety",
      definition: {
        en: "A number of different types of things.",
        th: "ความหลากหลาย",
        cn: "多样",
        tw: "多樣",
        vi: "sự đa dạng",
      },
    },
    {
      vocabulary: "purposes",
      definition: {
        en: "The reasons for which something is done.",
        th: "วัตถุประสงค์",
        cn: "目的",
        tw: "目的",
        vi: "mục đích",
      },
    },
    // ... up to ten entries
  ];

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={() => {}} className="mb-4 ml-3">
            {t("title")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <Book />
                <div className="ml-2">{t("title")}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {wordSample.map((word, index) => (
            <div
              key={index}
              className="pb-4 border-b-2"
            >
              <span className="font-bold text-cyan-500">
                {word.vocabulary}:{" "}
              </span>
              <span>{word.definition[currentLocale]}</span>
            </div>
          ))}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
