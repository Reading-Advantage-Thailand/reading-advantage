"use client";

import * as React from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
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

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArticleRecord } from "@/types";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { QuizStatus } from "./models/questions-model";
import { useScopedI18n } from "@/locales/client";

interface ReminderRereadTableProps {
  articles: ArticleRecord[];
}
export function ReminderRereadTable({ articles }: ReminderRereadTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.history.reminder");

  const columns: ColumnDef<ArticleRecord>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("title")}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="captoliza">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "scores",
      header: () => {
        return <div>{t("score")}</div>;
      },
      cell: ({ row }) => {
        return <div>{row.getValue("scores")}</div>;
      },
    },
    {
      accessorKey: "updated_at",
      header: () => <div>{t("date")}</div>,
      cell: ({ row }) => {
        const updatedAt = row.getValue("updated_at") as string;
        const date = formatDate(updatedAt);
        return <div>{date}</div>;
      },
    },
    {
      accessorKey: "rated",
      header: () => <div className="text-center">{t("rated")}</div>,
      cell: ({ row }) => {
        const amount = parseInt(row.getValue("rated"));
        return <div className="text-center font-medium">{amount}</div>;
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">{t("status")}</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as QuizStatus;
        const map = {
          [QuizStatus.READ]: "Read",
          [QuizStatus.COMPLETED_MCQ]: "Completed MCQ",
          [QuizStatus.COMPLETED_SAQ]: "Completed SAQ",
          [QuizStatus.COMPLETED_LAQ]: "Completed LAQ",
          [QuizStatus.UNRATED]: "Unrated",
        };
        return <div className="text-center font-medium">{map[status]}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: articles,
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
  const router = useRouter();

  const handleNavigateToArticle = (articleId: string) => {
    router.push(`/student/read/${articleId}`);
  };

  return (
    <div className="w-full">
      <div className="rounded-md border mt-3 mb-4 bg-[#ffedd5] dark:bg-[#7c2d12]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
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
                  onClick={() => handleNavigateToArticle(row.original.id)}
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
    </div>
  );
}
