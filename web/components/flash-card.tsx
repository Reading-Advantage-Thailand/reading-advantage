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
import { formatDate } from "@/lib/utils";
import { Header } from "./header";
import { toast } from "./ui/use-toast";
import { useScopedI18n } from "@/locales/client";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { v4 as uuidv4 } from "uuid";

type Props = {
  userId: string;
};
type Sentence = {
  articleId: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  endTimepoint: number;
  sentence: string;
  sn: number;
  timepoint: number;
  translation: { th: string };
  userId: string;
  id: string;
};

export default function FlashCard({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const controlRef = useRef<any>({});
  const currentCardFlipRef = useRef<any>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { theme } = useTheme();

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);
      console.log(res.data);
      setSentences(res.data.sentences);
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
      console.log(res.data);
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
                console.log("onCardChange index: ", index);
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
          />
        )}
      </div>
      <div></div>
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
