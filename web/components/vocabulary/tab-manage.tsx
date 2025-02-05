"use client";
import * as React from "react";
import { toast } from "../ui/use-toast";
import { useScopedI18n } from "@/locales/client";
import { formatDate, formatTimestamp, levelCalculation } from "@/lib/utils";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { State } from "ts-fsrs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { date_scheduler } from "ts-fsrs";
import { filter } from "lodash";
import { UserXpEarned } from "../models/user-activity-log-model";

export type Vocabulary = {
  articleId: string;
  word: string;
  definition: string;
  createdAt: string;
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

export default function VocabularyManageTab({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );

  const router = useRouter();
  const [vocabularies, setVocabularies] = React.useState<Vocabulary[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const getVocabularyData = async () => {
    try {
      const res = await fetch(`/api/v1/users/vocabularies/${userId}`);
      const data = await res.json();
      const startOfDay = date_scheduler(new Date(), 0, true);

      /*const filteredData = await data.vocabularies
        .filter((record: Vocabulary) => {
          const dueDate = new Date(record.due);
          return record.state === 0 || dueDate < startOfDay;
        })
        .sort((a: Vocabulary, b: Vocabulary) => {
          return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
        });
      */
      //setVocabularies(filteredData);

      if (!data || !data.vocabularies || !Array.isArray(data.vocabularies)) {
        console.error("Invalid API response:", data);
        return; // Or handle the error appropriately
      }

      const vocabulariesWithFormattedData = data.vocabularies.map(
        (vocabulary: any) => {
          const word = vocabulary.word || {}; // Handle missing word
          const definition = word.definition || {}; // Handle missing definition

          return {
            ...vocabulary,
            createdAtString: formatDateFromTimestamp(vocabulary.createdAt),
            word: word.vocabulary, // Access word.vocabulary, handle missing word
            definition:
              definition.th ||
              definition.en ||
              definition.cn ||
              definition.tw ||
              definition.vi ||
              "No definition", // Access definition.th (or other languages), handle missing definition
          };
        }
      );

      setVocabularies(vocabulariesWithFormattedData);

      console.log(data.vocabularies[0]);

      // updateScore
      let filterDataUpdateScore = filter(data.vocabularies, (item) => {
        const dueDate = new Date(item.due);
        return (
          (item.state === 2 || item.state === 3) &&
          dueDate < startOfDay &&
          !item.update_score
        );
      });

      if (filterDataUpdateScore?.length > 0) {
        for (let i = 0; i < filterDataUpdateScore.length; i++) {
          try {
            if (!filterDataUpdateScore[i]?.update_score) {
              await fetch(
                `/api/v1/assistant/ts-fsrs-test/flash-card/${filterDataUpdateScore[i]?.id}`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    ...filterDataUpdateScore[i],
                    update_score: true,
                  }),
                }
              );

              const updateScrore = await fetch(
                `/api/v1/users/${userId}/activitylog`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    articleId: filterDataUpdateScore[i]?.articleId,
                    activityType: "vocabulary_flashcards",
                    activityStatus: "completed",
                    xpEarned: UserXpEarned.Vocabulary_Flashcards,
                    details: {
                      ...filterDataUpdateScore[i],
                      cefr_level: levelCalculation(
                        UserXpEarned.Vocabulary_Flashcards
                      ).cefrLevel,
                    },
                  }),
                }
              );
              if (updateScrore?.status === 201) {
                toast({
                  title: t("toast.success"),
                  description: tUpdateScore("yourXp", {
                    xp: UserXpEarned.Vocabulary_Flashcards,
                  }),
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

  const formatDateFromTimestamp = (timestamp: any): string => {
    // Type any to handle various cases
    if (!timestamp) return ""; // Handle missing timestamp

    if (typeof timestamp === "object" && timestamp._seconds) {
      const seconds = timestamp._seconds;
      const nanoseconds = timestamp._nanoseconds;
      const milliseconds = seconds * 1000 + nanoseconds / 1000000;
      const date = new Date(milliseconds);
      return date.toLocaleString();
    } else if (typeof timestamp === "string") {
      try {
        const date = new Date(timestamp);
        return date.toLocaleString();
      } catch (error) {
        console.error("Invalid date string:", timestamp);
        return "Invalid Date";
      }
    }
    return "Invalid Date"; // Handle other cases
  };

  React.useEffect(() => {
    getVocabularyData();
  }, []);

  const columns: ColumnDef<Vocabulary>[] = [
    {
      accessorKey: "word",
      header: "Vocabulary",
      cell: ({ row }) => (
        <div
          className="capitalize cursor-pointer"
          onClick={() => handleNavigateToArticle(row.original.articleId)}
        >
          {row.getValue("word")}
        </div>
      ),
    },
    {
      accessorKey: "createdAtString",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("createdAtString")}</div>,
    },
    {
      accessorKey: "due",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{formatDate(row.getValue("due"))}</div>,
    },
    // {
    //   accessorKey: "update_score",
    //   header: ({ column }) => (
    //     <div className="text-center font-medium">Status</div>
    //   ),
    //   cell: ({ row }) => {
    //     const status = row.getValue("update_score");

    //     return (
    //       <div className="text-center font-medium">
    //         {status ? (
    //           <Badge className="bg-green-700" variant="outline">
    //             Complate
    //           </Badge>
    //         ) : (
    //           <Badge className="bg-orange-400" variant="outline">
    //             In Progress
    //           </Badge>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "delete",
      header: "",
      cell: ({ row }) => {
        return (
          <Button
            className="ml-auto font-medium"
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: vocabularies,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleNavigateToArticle = (articleId: string) => {
    router.push(`/student/read/${articleId}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/users/vocabularies/${id}`, {
        method: "DELETE",
        body: JSON.stringify({
          id,
        }),
      });
      const data = await res.json();
      if (data.status === 200) {
        const updateVocabularies = vocabularies.filter(
          (item) => item.id !== id
        );
        setVocabularies(updateVocabularies);
        toast({
          title: t("toast.success"),
          description: t("toast.successDescription"),
        });
      } else {
        toast({
          title: t("toast.error"),
          description: t("toast.errorDescription"),
          variant: "destructive",
        });
      }
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
      <div className="mt-5">
        <Header
          heading={t("savedVocabulary")}
          text={
            vocabularies?.length === 0
              ? t("noSavedVocabulary")
              : t("savedVocabularyDescription", {
                  total: vocabularies?.length,
                })
          }
        />
      </div>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder={"Search..."}
            value={
              (table.getColumn("vocabulary")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("vocabulary")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : typeof header.column.columnDef.header === "function"
                        ? header.column.columnDef.header(header.getContext())
                        : header.column.columnDef.header}{" "}
                      {/* Render header based on type */}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Empty
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
