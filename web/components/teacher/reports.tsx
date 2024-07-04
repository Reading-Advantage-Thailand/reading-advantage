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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import EditStudent from "./edit-student";
import RemoveStudent from "./remove-student-inclass";
import { Header } from "@/components/header";
import ClassroomData from "@/lib/classroom-utils";
import { set } from "lodash";

type Student = {
  studentId: string;
  lastActivity: Date;
  studentName: string;
  classroomName: string;
  classroomId: string;
  email: string;
  xp: number;
};

type Classrooms = {
  classroomId: string;
  classroomName: string;
};

type Classes = {
  id: string;
  classroomName: string;
};

type MyStudentProps = {
  userId: string;
  studentInClass: Student[];
  classrooms: Classrooms[];
  classes: Classes[]; 
};

export default function Reports({ studentInClass, userId, classrooms, classes}: MyStudentProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const trp = useScopedI18n("components.reports"); 
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");

  let action = "";

  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }, [selectedStudentId, action, redirectUrl, router]);

  const handleActionSelected = (
    action: string,
    studentId: string,
    classroomId: string,
  ) => {
    switch (action) {
      case "view details":
        setRedirectUrl(`/teacher/student-progress/${studentId}`)
        break;
      default:
        console.log("default");
        break;
    }
  };

  const calculateAverageLevel = (data: any) => {
    let sum = 0;
    studentInClass.forEach((student: any) => {
      sum += student.level;
    });
    return sum / data.length;
  };
  const averageLevel = calculateAverageLevel(studentInClass);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "studentName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
           {trp('name')}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const studentName: string = row.getValue("studentName");
        return (
          <div className="captoliza ml-4" onClick={() => row.toggleSelected}>
            {studentName ? studentName : "Anonymous"}
          </div>
        );
      },
    },
    {
      accessorKey: "xp",
      header: ({ column }) => {
        return <Button variant="ghost">{trp('xp')}</Button>;
      },
      cell: ({ row }) => (
        <div className="captoliza ml-4">{row.getValue("xp")}</div>
      ),
    },
    {
      accessorKey: "level",
      header: ({ column }) => {
        return <Button variant="ghost">{trp('level')}</Button>;
      },
      cell: ({ row }) => (
        <div className="captoliza ml-4">{row.getValue("level")}</div>
      ),
    },
    {
      accessorKey: "lastActivity",
      header: ({ column }) => {
        return <Button variant="ghost">{trp('lastActivity')}</Button>;
      },
      cell: ({ row }) => {
        const lastActivity = row.getValue("lastActivity");
        let lastActivityDate;

        if (typeof lastActivity === "string") {
          lastActivityDate = new Date(lastActivity);
        } else if (
          lastActivity &&
          typeof lastActivity === "object" &&
          "_seconds" in lastActivity
        ) {
          lastActivityDate = new Date(
            (lastActivity as { _seconds: number })._seconds * 1000
          );
        }

        return (
          <div className="captoliza ml-4">
            {lastActivityDate && lastActivityDate.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "studentId",
      header: ({ column }) => {
        return null;
      },
      cell: ({ row }) => null,
    },
    {
      accessorKey: "classroomId",
      header: ({ column }) => {
        return null;
      },
      cell: ({ row }) => null,
    },
    {
      accessorKey: "action",
      header: ({ column }) => {
        return <Button variant="ghost">{trp('actions')}</Button>;
      },
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="ml-auto">
              {trp('actions')} <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem>
              <Link
                href={redirectUrl}
                onClick={() =>
                  handleActionSelected(
                    "view details",
                    row.getValue("studentId"),
                    row.getValue("classroomId")
                  )
                }
              >
                {trp('viewDetails')}
              </Link>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      accessorKey: "detail",
      header: ({ column }) => {
        return <Button variant="ghost">{trp('detail')}</Button>;
      },
      cell: ({ row }) => (
        <div className="captoliza flex gap-2 ml-4" >
        <EditStudent
        userId={userId}
          studentInClass={studentInClass}
          studentIdSelected={row.getValue("studentId")}
          />
          <RemoveStudent 
          studentInClass={studentInClass}
          userId={userId}
          studentIdSelected={row.getValue("studentId")}
          classroomIdSelected={studentInClass[0].classroomId}
          />
        </div>
      ),
    },
  ];

  const fetchStudentDataOnClick = async (classroomId: string) => {
    setRedirectUrl(`/teacher/reports/${classroomId}`);
  }

  const table = useReactTable({
    data: studentInClass,
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
     {classrooms.length ? (
        studentInClass.length ? (
          <div className="font-bold text-3xl">
            {trp("title", { className: studentInClass[0].classroomName })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Header heading={trp("noStudent")} />
          </div>
        )
      ) : (
        <div>
          <Header heading="Reports" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto mt-4">
                {selectedClassroom === ""
                  ? "Select a Classroom"
                  : selectedClassroom}{" "}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {classes.map((classroom) => (
                <DropdownMenuCheckboxItem
                  key={classroom.id}
                  className="capitalize"
                  onSelect={() => {
                    setSelectedClassroom(classroom.classroomName);
                    fetchStudentDataOnClick(classroom.id);
                  }}
                >
                  {classroom.classroomName}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="grid grid-cols-2 items-end">
        <Input
          placeholder={trp('search')}
          value={
            (table.getColumn("studentName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
        {studentInClass.length > 0 ? (
          <div className="flex justify-end">
            <Card className="flex items-center justify-center w-[50%]">
              <CardContent className="mt-4">
                {trp('averageLevel')}
                <span className="text-xl ml-2">{averageLevel}</span>{" "}
              </CardContent>
            </Card>
          </div>
        ) : null}
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
                    <TableCell
                      key={cell.id}
                      onClick={() =>
                        setSelectedStudentId(
                          cell.getContext().cell.row.getValue("studentId")
                        )
                      }
                    >
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
