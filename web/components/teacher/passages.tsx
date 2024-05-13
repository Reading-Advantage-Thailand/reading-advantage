"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Checkbox } from "@mui/material";
import ArticleShowcaseCard from "../article-showcase-card";
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
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useScopedI18n } from "@/locales/client";
import { Article } from "../dnd/types";
import { articleShowcaseType } from "@/types";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { camelToSentenceCase } from "@/lib/utils";
import { Rating } from "@mui/material";
import { Header } from "../header";

interface CustomCheckboxProps {
  label: string;
}
type Passage = {
  id: string;
  title: string;
  type: string;
  ra_level: number;
  genre: string;
  subgenre: string;
  is_read: boolean; 
  cefr_level: string;
  summary: string;
  average_rating: number;
  article: articleShowcaseType;

};
type PassagesProps = {
  passages: Passage[];
};

export default function Passages(passages: PassagesProps) {
  const [isFilterByTypeChecked, setIsFilterByTypeChecked] = useState(false);
  const [isFilterByLevel, setIsFilterByLevel] = useState(false);
  const [isFilterByGenre, setIsFilterByGenre] = useState(false);
  const [isFilterBySubgenre, setIsFilterBySubgenre] = useState(false);
  const [isFictionChecked, setIsFictionChecked] = useState(false);
  const [isNonFictionChecked, setIsNonFictionChecked] = useState(false);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");

  const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label }) => {
    const [selected, setSelected] = useState(false);
    return (
      <div
        className={`border-2 ${
          selected ? "bg-primary text-white" : "border-gray-300"
        } p-2 m-2 cursor-pointer w-[40px]`}
        onClick={() => setSelected(!selected)}
      >
        {label}
      </div>
    );
  };

  const columns: ColumnDef<Passage>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
       return null;
      },
      cell: ({ row }) => {
        const passage = row.original;
        return (
          <div className="captoliza ml-4">
             <Link href={`/student/read/${passage.id}`}>
      <div
        className="w-full flex flex-col gap-1 h-[20rem] bg-cover bg-center p-3 rounded-md hover:scale-105 transition-all duration-300 bg-black "
        style={{
          backgroundImage: `url('https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${passage.id}.png')`,
          boxShadow: "inset 80px 10px 90px 10px rgba(0, 0, 0, 0.9)",
          opacity: passage.is_read ? 0.3 : 1,
        }}
      >
        <Badge className="shadow-lg max-w-max" variant="destructive">
          Reading Advantage Level: {passage.ra_level}
        </Badge>
        <Badge className="shadow-lg max-w-max" variant="destructive">
          CEFR Level: {passage.cefr_level}
        </Badge>
        <Badge className="shadow-lg max-w-max" variant="destructive">
          <Rating name="read-only" value={passage.average_rating} readOnly />
        </Badge>
        <div className="mt-auto">
          <p className="text-xl drop-shadow-lg font-bold text-white">
            {passage.title}
          </p>
          <p className="text-sm drop-shadow-lg line-clamp-4">
            {passage.summary}
          </p>
        </div>
      </div>
      {passage.is_read && (
        <div className="flex justify-center">
          <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
            Previously Read
          </Badge>
        </div>
      )}
      </Link>
    </div>
    
        )
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
       return null;
      },
      cell: ({ row }) => {
        return null
      },
    },
    {
      accessorKey: "level",
      header: ({ column }) => {
       return null;
      },
      cell: ({ row }) => {
        return null
      },
    },
    {
      accessorKey: "genre",
      header: ({ column }) => {
       return null;
      },
      cell: ({ row }) => {
        return null
      },
    },
    {
      accessorKey: "subgenre",
      header: ({ column }) => {
       return null;
      },
      cell: ({ row }) => {
        return null
      },
    },
  ];

  const table = useReactTable({
    data: passages.passages,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      <Header heading="Passages Page" />
      <Input
          placeholder={"Search..."}
          value={
            (table.getColumn("title")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
      {/* <div className="grid grid-cols-4 items-start"> */}

      <div>
        <div className="flex items-center">
          <Checkbox onChange={() => setIsFilterByTypeChecked(!isFilterByTypeChecked)}/>
          <p>Filter by Type</p>
        </div>
        {isFilterByTypeChecked && (
        <div className="ml-4">
          <div className="flex items-center">
            <Checkbox />
            <p>Fiction</p>
          </div>
          <div className="flex items-center">
            <Checkbox />
            <p>Non Fiction</p>
          </div>
        </div>
        )}
      </div>
      <div className="flex items-center ">
        <Checkbox />
        <p>Filter by Genre</p>
      </div>
      <div className="flex items-center">
        <Checkbox />
        <p>Filter by Subgenre</p>
      </div>
      <div className="flex items-center">
        <Checkbox onChange={() => setIsFilterByLevel(!isFilterByLevel)}/>
        <p>Filter by Level</p>
      </div>
      {/* </div> */}
        {isFilterByLevel && (
      <div className="grid grid-cols-6">
        <CustomCheckbox label="1" />
        <CustomCheckbox label="2" />
        <CustomCheckbox label="3" />
        <CustomCheckbox label="4" />
        <CustomCheckbox label="5" />
        <CustomCheckbox label="6" />
        <CustomCheckbox label="7" />
        <CustomCheckbox label="8" />
        <CustomCheckbox label="9" />
        <CustomCheckbox label="10" />
        <CustomCheckbox label="11" />
        <CustomCheckbox label="12" />
        <CustomCheckbox label="13" />
        <CustomCheckbox label="14" />
        <CustomCheckbox label="15" />
        <CustomCheckbox label="16" />
        <CustomCheckbox label="17" />
        <CustomCheckbox label="18" />
      </div>
        )}

<div className="rounded-md border mt-4">
        <Table>
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
    </div>
  );
}
