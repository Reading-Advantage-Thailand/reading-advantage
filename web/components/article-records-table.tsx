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
import { Checkbox } from "@/components/ui/checkbox";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import { QuizStatus } from "./models/questions-model";

export const columns: ColumnDef<ArticleRecord>[] = [
  // check box
  // {
  //     id: "select",
  //     header: ({ table }) => (
  //         <Checkbox
  //             checked={table.getIsAllPageRowsSelected()}
  //             onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
  //             aria-label="Select all"
  //         />
  //     ),
  //     cell: ({ row }) => (
  //         <Checkbox
  //             checked={row.getIsSelected()}
  //             onCheckedChange={(value: any) => row.toggleSelected(!!value)}
  //             aria-label="Select row"
  //         />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  // },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="captoliza">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "scores",
    header: ({ column }) => {
      return <div>{column.id}</div>;
    },
  },
  {
    accessorKey: "updated_at",
    header: "Date",
    cell: ({ row }) => {
      const updatedAt = row.getValue("updated_at") as string;
      const date = formatDate(updatedAt);
      return <div>{date}</div>;
    },
  },
  {
    accessorKey: "rated",
    header: () => <div className="text-center">Rated</div>,
    cell: ({ row }) => {
      const amount = parseInt(row.getValue("rated"));
      return <div className="text-center font-medium">{amount}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
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

  // {
  //     id: "actions",
  //     enableHiding: false,
  //     cell: () => {
  //         return (
  //             <DropdownMenu>
  //                 <DropdownMenuTrigger asChild>
  //                     <Button variant="ghost" className="h-8 w-8 p-0">
  //                         <span className="sr-only">Open menu</span>
  //                         <DotsHorizontalIcon className="h-4 w-4" />
  //                     </Button>
  //                 </DropdownMenuTrigger>
  //                 <DropdownMenuContent align="end">
  //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //                     <DropdownMenuItem className="text-[#e11d48]">Delete</DropdownMenuItem>
  //                 </DropdownMenuContent>
  //             </DropdownMenu>
  //         )
  //     },
  // },
];

interface ArticleRecordsTableProps {
  className?: string;
  articles: ArticleRecord[];
}

export function ArticleRecordsTable({ articles }: ArticleRecordsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
  const t = useScopedI18n("components.articleRecordsTable");
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={"Search..."}
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
    </div>
  );
}
