"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table-flash-card";

type Props = {
  index: number;
  nextCard: Function;
  sentences: Sentence[];
};

type Logs = {
  rating: Rating;
  state: State;
  due: Date;
  elapsed_days: number;
  scheduled_days: number;
  review: Date;
};

export default function FlashCardPracticeButton({
  index,
  nextCard,
  sentences,
}: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  console.log("==> sentences", sentences);
  const [review, setReview] = useState(new Date());
  const [cards, setCards] = useState<any>([]);
  const [logs, setLogs] = useState<any>([]);
  const [showButton, setShowButton] = useState(true);
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
  const fnFsrs: FSRS = fsrs(params);
  // let scheduling_cards: RecordLog = f.repeat(card, startOfDay);

  const columnsCards: ColumnDef<Card>[] = [
    {
      accessorKey: "index",
      header: () => <div className="font-bold text-black">Index</div>,
    },
    {
      accessorKey: "due",
      header: () => <div className="font-bold text-black">Due</div>,
      cell: ({ row }: any) => {
        return row.getValue("due").toLocaleString();
      },
    },
    {
      accessorKey: "state",
      header: () => <div className="font-bold text-black">State</div>,
      cell: ({ row }: any) => {
        return `${row.getValue("state")} (${State[row.getValue("state")]})`;
      },
    },
    {
      accessorKey: "last_review",
      header: () => <div className="font-bold text-black">Last Review</div>,
      cell: ({ row }: any) => {
        return row.getValue("last_review").toLocaleString();
      },
    },
    {
      accessorKey: "stability",
      header: () => <div className="font-bold text-black">Stability</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">
            {row.getValue("stability").toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "difficulty",
      header: () => <div className="font-bold text-black">Difficulty</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">
            {row.getValue("difficulty").toFixed(2)}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "due",
    //   header: () => <div className="font-bold text-black">R</div>,
    //   cell: ({ row }: any) => {

    //     return (
    //       <div className="text-center">
    //         {`${fnFsrs?.get_retrievability(row, row.due) || "/"}`}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "elapsed_days",
      header: () => <div className="font-bold text-black">Elapsed Days</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">
            {row.getValue("elapsed_days").toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "scheduled_days",
      header: () => <div className="font-bold text-black">Scheduled Days</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">
            {row.getValue("scheduled_days").toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "reps",
      header: () => <div className="font-bold text-black">Reps</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">{row.getValue("reps").toFixed(2)}</div>
        );
      },
    },
    {
      accessorKey: "lapses",
      header: () => <div className="font-bold text-black">Lapses</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">{row.getValue("lapses").toFixed(2)}</div>
        );
      },
    },
  ];

  const handleClickFsrs = async (index: number, rating: Rating) => {
    console.log("==> cards", cards.length);
    console.log(Rating[rating]);
    const preCard: any =
      cards.length > 0 ? cards[cards.length - 1] : createEmptyCard(new Date());
    const scheduling_cards: any = fnFsrs.repeat(preCard, preCard.due);
    console.log(scheduling_cards);
    setCards((pre: any) => [...pre, scheduling_cards[rating].card]);
    setLogs((pre: any) => [...pre, scheduling_cards[rating].log]);

    if (index + 1 === sentences.length) {
      setShowButton(false);
    }
  };

  return (
    <>
      {showButton && (
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
      )}
      <div className="pt-4">Next review: {review.toLocaleString()}</div>
      <div className="pt-4">Cards:</div>
      <DataTable data={cards} columns={columnsCards} />
      <div className="pb-10"></div>
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
          {cards.map((record: Card, index: number) => (
            <tr className="hover:bg-zinc-200" key={index}>
              <td>{index + 1}</td>
              <td>{record.due.toLocaleString()}</td>
              <td>{`${record.state}(${State[record.state]})`}</td>
              <td>
                {record.last_review && record.last_review.toLocaleString()}
              </td>
              <td>{record.stability.toFixed(2)}</td>
              <td>{record.difficulty.toFixed(2)}</td>
              <td>{fnFsrs.get_retrievability(record, record.due) || "/"}</td>
              <td>{record.elapsed_days}</td>
              <td>{record.scheduled_days}</td>
              <td>{record.reps}</td>
              <td>{record.lapses}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
      <div className="pt-4">Log Record:</div>
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
