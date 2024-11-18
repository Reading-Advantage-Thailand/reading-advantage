"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
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
import CreateNewClass from "./create-new-class";
import EditClass from "./edit-class";
import DeleteClass from "./delete-class";
import ArchiveClass from "./archive-class";
import { Header } from "../header";

type Classes = {
  classroomName: string;
  classCode: string;
  noOfStudents: number;
  grade: string;
  coTeacher: {
    coTeacherId: string;
    name: string;
  };
  id: string;
  archived: boolean;
  title: string;
  student: [
    {
      studentId: string;
      lastActivity: Date;
    }
  ];
};

type MyClassesProps = {
  userId: string;
  userName: string;
  classrooms: Classes[];
};

export default function MyClasses({
  userId,
  userName,
  classrooms,
}: MyClassesProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const tc = useScopedI18n("components.myClasses");
  const router = useRouter();

  const columns: ColumnDef<Classes>[] = [
    {
      accessorKey: "classroomName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tc("className")}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const classroomName: string = row.getValue("classroomName");
        return (
          <div className="captoliza ml-4">
            {classroomName ? classroomName : "Unknown"}
          </div>
        );
      },
    },
    {
      accessorKey: "classCode",
      header: () => {
        return <div className="text-center">{tc("classCode")}</div>;
      },
      cell: ({ row }) => (
        <div className="captoliza text-center">{row.getValue("classCode")}</div>
      ),
    },
    {
      accessorKey: "student.lenght",
      header: () => {
        return <div className="text-center">{tc("studentCount")}</div>;
      },
      cell: ({ row }) => (
        <div className="captoliza text-center">
          {row.original?.student?.length || 0}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => {
        return <div className="text-center">{tc("actions")}</div>;
      },
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="ml-auto">
                  {tc("actions")} <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/teacher/class-roster/${payment.id}`
                    )
                  }
                >
                  {tc("roster")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/teacher/reports/${payment.id}`
                    )
                  }
                >
                  {tc("reports")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
    {
      accessorKey: "detail",
      header: () => {
        return <div className="text-center">{tc("detail")}</div>;
      },
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <div className="captoliza justify-center flex gap-2">
            <EditClass classroomData={payment} />
            <ArchiveClass classroomData={payment} />
            <DeleteClass classroomData={payment} />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: classrooms,
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
      <div className="flex flex-col gap-4">
        <Header heading={tc("title")} />
        <div className="flex justify-between items-center">
          <Input
            placeholder={tc("search")}
            value={
              (table.getColumn("classroomName")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("classroomName")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <CreateNewClass userId={userId} userName={userName} />
        </div>
        <div className="rounded-md border">
          <Table style={{ tableLayout: "fixed", width: "100%" }}>
            <TableHeader className="font-bold">
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
        <div className="flex items-center justify-end space-x-2">
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
    </>
  );
}
