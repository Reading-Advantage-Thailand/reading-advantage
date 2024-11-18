"use client";
import React from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import EditStudent from "./edit-student";
import RemoveStudent from "./remove-student-inclass";
import { Header } from "@/components/header";
import { ScrollArea } from "../ui/scroll-area";

type StudentData = {
  id: string;
  display_name: string;
  email: string;
  last_activity: string;
  level: number;
  xp: number;
};

type Classrooms = {
  id: string;
  classroomName: string;
  student: StudentInClass[];
};

type StudentInClass = {
  studentId: string;
  lastActivity: string;
};

type Classes = {
  id: string;
  classroomName: string;
};

type MyStudentProps = {
  studentInClass?: StudentData[];
  classrooms?: Classrooms[];
  classes?: Classes[];
};

export default function Reports({
  studentInClass,
  classrooms,
  classes,
}: MyStudentProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const trp = useScopedI18n("components.reports");
  const router = useRouter();

  const calculateAverageLevel = (data: any) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return 0; // Handle case where data is invalid or empty
    }
    let sum = 0;
    let count = 0;

    data?.forEach((student: any) => {
      if (student?.level !== undefined && student?.level !== null) {
        sum += student.level;
        count++;
      }
    });

    return count > 0 ? sum / count : 0;
  };

  const averageLevel = calculateAverageLevel(studentInClass);

  const columns: ColumnDef<StudentData>[] = [
    {
      accessorKey: "display_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {trp("name")}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="captoliza ml-4" onClick={() => row.toggleSelected}>
            {row.getValue("display_name")}
          </div>
        );
      },
    },
    {
      accessorKey: "xp",
      header: () => {
        return <div className="text-center">{trp("xp")}</div>;
      },
      cell: ({ row }) => (
        <div className="captoliza text-center">{row.getValue("xp")}</div>
      ),
    },
    {
      accessorKey: "level",
      header: () => {
        return <div className="text-center">{trp("level")}</div>;
      },
      cell: ({ row }) => (
        <div className="captoliza text-center">{row.getValue("level")}</div>
      ),
    },
    {
      accessorKey: "last_activity",
      header: () => {
        return <div className="text-center">{trp("lastActivity")}</div>;
      },
      cell: ({ row }) => {
        return (
          <div className="captoliza text-center">
            {row.getValue("last_activity")
              ? row.getValue("last_activity")
              : "No Activity"}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => {
        return <div className="text-center">{trp("actions")}</div>;
      },
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="ml-auto">
                  {trp("actions")} <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/teacher/student-progress/${payment.id}`
                    )
                  }
                >
                  {trp("viewDetails")}
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
        return <div className="text-center">{trp("detail")}</div>;
      },
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex gap-2 justify-center">
            <EditStudent userData={payment} />
            {classrooms && (
              <RemoveStudent userData={payment} classroomData={classrooms} />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: studentInClass || [],
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
      {classes && (
        <div>
          <Header heading="Reports" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mt-4">
                Select a Classroom
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <ScrollArea className="h-[300px]">
                {classes.map((classroom) => (
                  <DropdownMenuItem
                    key={classroom.id}
                    className="capitalize"
                    onClick={() =>
                      router.push(`/teacher/reports/${classroom.id}`)
                    }
                  >
                    {classroom.classroomName}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {classrooms &&
        (studentInClass?.length ? (
          <Header
            heading={trp("title", { className: classrooms[0].classroomName })}
          />
        ) : (
          <Header heading={trp("noStudent")} />
        ))}

      <div className="grid grid-cols-2 items-end">
        <Input
          placeholder={trp("search")}
          value={
            (table.getColumn("display_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("display_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
        {studentInClass && (
          <div className="flex justify-end">
            <Card className="flex items-center justify-center w-[50%]">
              <CardContent className="mt-4">
                {trp("averageLevel")}
                <span className="text-xl ml-2">{averageLevel.toFixed(2)}</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="rounded-md border mt-4">
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
    </>
  );
}
