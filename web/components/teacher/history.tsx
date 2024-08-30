"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
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
import { Input } from "@/components/ui/input";
import { useScopedI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { Header } from "@/components/header";
import { toast } from "../ui/use-toast";
import { UserActivityLog } from "../models/user-activity-log-model";

type MyRosterProps = {
  userActivityLog: UserActivityLog[];
};

export default function TeacherHistory({ userActivityLog }: MyRosterProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const tr = useScopedI18n("components.classRoster");

  function formatActivityType(type: string): string {
    const activityMap: { [key: string]: string } = {
      article_read: "Article Read",
      mc_question: "Multiple Choice Question",
      sa_question: "Short Answer Question",
      la_question: "Long Answer Question",
      article_rating: "Article Rating",
      level_test: "Level Test",
      sentence_flashcards: "Sentence Flashcards",
      sentence_matching: "Sentence Matching",
      sentence_ordering: "Sentence Ordering",
      sentence_word_ordering: "Sentence Word Ordering",
      sentence_cloze_test: "Sentence Cloze Test",
      vocabulary_flashcards: "Vocabulary Flashcards",
      vocabulary_matching: "Vocabulary Matching",
    };

    return (
      activityMap[type] ||
      type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  }

  const columns: ColumnDef<UserActivityLog>[] = [
    {
      accessorKey: "timestamp",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="captoliza ml-4">
          {new Date(row.getValue("timestamp")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorFn: (row) => formatActivityType(row.activityType),
      id: "activityType",
      header: "Activity",
      cell: ({ row }) => (
        <div className="ml-4">{row.getValue("activityType")}</div>
      ),
    },
    {
      accessorFn: (row) => row.title || "--",
      id: "title",
      header: "Activity Title",
      cell: ({ row }) => (
        <div className="captoliza ml-4">{row.getValue("title")}</div>
      ),
    },
    {
      accessorFn: (row) => row.level || "--",
      id: "level",
      header: "Level",
      cell: ({ row }) => (
        <div className="captoliza ml-4">{row.getValue("level")}</div>
      ),
    },
  ];

  const table = useReactTable({
    data: userActivityLog,
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

  return (
    <>
      <div className="flex justify-between">
        <Input
          placeholder={tr("search")}
          value={
            (table.getColumn("activityType")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("activityType")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
      </div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader className="font-bold">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableCell key={header.id}>
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="cursor-pointer"
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {t("select", {
            selected: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </>
  );
}
