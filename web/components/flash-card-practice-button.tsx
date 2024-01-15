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
  console.log("==> sentences", sentences);
  const [review, setReview] = React.useState(new Date());
  const [cards, setCards] = React.useState([createEmptyCard()] || []);
  const [logs, setLogs] = React.useState<any>([]);
  // const params = generatorParameters({ enable_fuzz: true });
  // let now = new Date();
  // const startOfDay = new Date(
  //   now.getFullYear(),
  //   now.getMonth(),
  //   now.getDate(),
  //   4,
  //   0,
  //   0,
  //   0
  // );
  // let card: Card = createEmptyCard();

  const params = generatorParameters();
  const f: FSRS = fsrs(params);
  // let scheduling_cards: RecordLog = f.repeat(card, startOfDay);

  const handleClickFsrs = async (index: number, rating: Rating) => {
    console.log("==> cards", cards.length);
    console.log(Rating[rating]);
    const preCard: any =
      cards.length > 0 ? cards[cards.length - 1] : createEmptyCard(new Date());
    const scheduling_cards: any = f.repeat(preCard, preCard.due);
    console.log(scheduling_cards);
    setCards((pre) => [...pre, scheduling_cards[rating].card]);
    setLogs((pre: any) => [...pre, scheduling_cards[rating].log]);
  };

  return (
    <>
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
      <div className="pt-4">Next review: {review.toLocaleString()}</div>
      <div className="pt-4">Cards:</div>
      <table>
        <thead>
          <tr>
            <th>index</th>
            <th>due</th>
            <th>state</th>
            <th>last_review</th>
            <th>stability</th>
            <th>difficulty</th>
            <th>R</th>
            <th>elapsed_days</th>
            <th>scheduled_days</th>
            <th>reps</th>
            <th>lapses</th>
          </tr>
        </thead>
        <tbody className="text-sm text-center">
          {cards.map((record, index) => (
            <tr className="hover:bg-zinc-200" key={index}>
              <td>{index + 1}</td>
              <td>{record.due.toLocaleString()}</td>
              <td>{`${record.state}(${State[record.state]})`}</td>
              <td>
                {record.last_review && record.last_review.toLocaleString()}
              </td>
              <td>{record.stability.toFixed(2)}</td>
              <td>{record.difficulty.toFixed(2)}</td>
              <td>{f.get_retrievability(record, record.due) || "/"}</td>
              <td>{record.elapsed_days}</td>
              <td>{record.scheduled_days}</td>
              <td>{record.reps}</td>
              <td>{record.lapses}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
      <div className="pt-4">logRecord:</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>rating</th>
            <th>state</th>
            <th>due</th>
            <th>elapsed_days</th>
            <th>scheduled_days</th>
            <th>review</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((record: any, index: any) => (
            <tr className="hover:bg-zinc-200" key="index">
              <th>{"=>"}</th>
              <td>{`${record.rating}(${Rating[record.rating]})`}</td>
              <td>{`${record.state}(${State[record.state]})`}</td>
              <td>{record.due.toLocaleString()}</td>
              <td>{record.elapsed_days}</td>
              <td>{record.scheduled_days}</td>
              <td>{record.review.toLocaleString()}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
    </>
  );
}
