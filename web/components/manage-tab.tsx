"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { toast } from "./ui/use-toast";
import axios from "axios";
import { formatDate, updateScore } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { State } from "ts-fsrs";
import { useRouter } from "next/navigation";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { date_scheduler } from "ts-fsrs";
import { filter } from "lodash";

dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

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

type Props = {
  userId: string;
};

export default function ManageTab({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );

  const router = useRouter();
  const [sentences, setSentences] = useState<Sentence[]>([]);

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);
      const startOfDay = date_scheduler(new Date(), 0, true);
      const filteredData = await res.data.sentences
        .filter((record: Sentence) => {
          const dueDate = new Date(record.due);
          return record.state === 0 || dueDate < startOfDay;
        })
        .sort((a: Sentence, b: Sentence) => {
          return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
        });

      setSentences(filteredData);

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
                router.refresh();
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
  }, [getUserSentenceSaved]);

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

  return (
    <>
      <Card className="col-span-3 mt-4 mb-10">
        <CardHeader>
          <div className="flex flex-row -mx-4 p-2">
            <div>
              <CardTitle>{t("savedSentences")}</CardTitle>
              <CardDescription>
                {sentences.length == 0
                  ? t("noSavedSentences")
                  : t("savedSentencesDescription", {
                      total: sentences.length,
                    })}
              </CardDescription>
            </div>
          </div>
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
      {/* )}  */}
    </>
  );
}
