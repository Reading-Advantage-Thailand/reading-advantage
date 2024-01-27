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
  ReviewLog,
} from "ts-fsrs";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { DataTable } from "@/components/data-table-flash-card";
import { columns } from './reminder-reread-table';

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
  console.log("==> sentences", sentences);
  const t = useScopedI18n("pages.student.practicePage"); 
  const [cards, setCards] = useState<Sentence[]>(sentences);
  const [showButton, setShowButton] = useState(true);
  const [logs, setLogs] = useState<Logs[]>([]);  
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
  const params = generatorParameters();
  const fnFsrs: FSRS = fsrs(params);

    const truncateText = (text: string, maxLength: number) => {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      } else {
        return text;
      }
    };
  
  const columnsCards: ColumnDef<Card>[] = [
    {
      accessorKey: "index",
      header: () => <div className="font-bold text-black">Index</div>,
      cell: ({ row }: any) => {
        return <div className="text-center">{row.index + 1}</div>;
      },
    },
    {
      accessorKey: "sentence",
      header: () => <div className="font-bold text-black">Sentence</div>,
      cell: ({ row }: any) => {
        return truncateText(row.getValue("sentence"), 20);
      },
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
    // {
    //   accessorKey: "last_review",
    //   header: () => <div className="font-bold text-black">Last Review</div>,
    //   cell: ({ row }: any) => {
    //     return row.getValue("last_review").toLocaleString();
    //   },
    // },
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
    {
      accessorKey: "elapsed_days",
      header: () => <div className="font-bold text-black">Elapsed Days</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">{row.getValue("elapsed_days")}</div>
        );
      },
    },
    {
      accessorKey: "scheduled_days",
      header: () => <div className="font-bold text-black">Scheduled Days</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">{row.getValue("scheduled_days")}</div>
        );
      },
    },
    {
      accessorKey: "reps",
      header: () => <div className="font-bold text-black">Reps</div>,
      cell: ({ row }: any) => {
        return <div className="text-center">{row.getValue("reps")}</div>;
      },
    },
    {
      accessorKey: "lapses",
      header: () => <div className="font-bold text-black">Lapses</div>,
      cell: ({ row }: any) => {
        return <div className="text-center">{row.getValue("lapses")}</div>;
      },
    },
  ];

  const columnsLogs: ColumnDef<Logs>[] = [
    {
      accessorKey: "#",
      header: () => <div className="font-bold text-black">#</div>,
      cell: () => {
        return "=>";
      },
    },
    {
      accessorKey: "rating",
      header: () => <div className="font-bold text-black">Rating</div>,
      cell: ({ row }: any) => {
        return `${row.getValue("rating")} (${Rating[row.getValue("rating")]})`;
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
      accessorKey: "due",
      header: () => <div className="font-bold text-black">Due</div>,
      cell: ({ row }: any) => {
        return row.getValue("due").toLocaleString();
      },
    },
    {
      accessorKey: "elapsed_days",
      header: () => <div className="font-bold text-black">Elapsed Days</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">
            {row.getValue("elapsed_days").toFixed(0)}
          </div>
        );
      },
    },
    {
      accessorKey: "scheduled_days",
      header: () => <div className="font-bold text-black">Scheduled Days</div>,
      cell: ({ row }: any) => {
        return (
          <div className="text-center">{row.getValue("scheduled_days")}</div>
        );
      },
    },
    {
      accessorKey: "review",
      header: () => <div className="font-bold text-black">Review</div>,
      cell: ({ row }: any) => {
        return row.getValue("review")?.toLocaleString();
      },
    },
  ];



  const handleClickFsrs = async (index: number, rating: Rating) => {
    const idSentence = sentences[index].id;

    console.log("idSentence : ", idSentence);
    console.log("rating : ", rating);

    const preCard = cards[index];    
    const scheduling_cards: any = fnFsrs.repeat(preCard, preCard.due);

    console.log("scheduling_cards : ", scheduling_cards);
    console.log(
      "scheduling_cards[rating].card : ",
      scheduling_cards[rating].card
    );

    // set cards by index
    const newCards = [...cards];
    newCards[index] = scheduling_cards[rating].card;
    setCards(newCards);

    // set logs by index
    const newLogs = [...logs];
    newLogs[index] = scheduling_cards[rating].log;
    setLogs(newLogs);

    const response = await axios.patch(`/api/ts-fsrs`, {
      body: JSON.stringify({
        ...newCards[index],
      }),
    });

    console.log("==> response : ", response);

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
      <div className="pt-4 font-bold">Cards :</div>
      <DataTable data={cards} columns={columnsCards} />

      {/* <div className="pt-4 font-bold">Log Record :</div>
      <DataTable data={logs} columns={columnsLogs} /> */}


    </>
  );
}
