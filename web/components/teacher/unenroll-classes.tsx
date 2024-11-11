"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
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
import { Checkbox } from "../ui/checkbox";
import { Input } from "@/components/ui/input";
import { useScopedI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";

type Student = {
  id: string;
  email: string;
  name: string;
};

type Classroom = {
  id: string;
  classroomName: string;
  classCode: string;
  grade: string;
  coTeacher: {
    coTeacherId: string;
    name: string;
  };
  archived: boolean;
  teacherId: string;
};

type MyEnrollProps = {
  enrolledClasses: Classroom[];
  matchedNameOfStudents: Student[];
  updateStudentList: any;
  studentId: string;
};

export default function MyUnEnrollClasses({
  enrolledClasses,
  matchedNameOfStudents,
  updateStudentList,
  studentId,
}: MyEnrollProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const tu = useScopedI18n("components.myStudent.unEnrollPage");
  const router = useRouter();
  const [classroomId, setClassroomId] = useState("");

  const handleStudentUnEnrollment = async (
    classroomId: string,
    enrolledClasses: any,
    studentId: string
  ) => {
    const removedStudentInClass: any[] = [];
    enrolledClasses.forEach((classroom: any) => {
      if (classroom.id === classroomId) {
        classroom.student.forEach((student: any) => {
          if (student.studentId !== studentId) {
            removedStudentInClass.push(student.studentId);
          }
        });
      }
    });

    const updateStudentListBuilder = removedStudentInClass.map((studentId) => {
      const matchedStudent = updateStudentList.find(
        (student: { studentId: string }) => student.studentId === studentId
      );
      return {
        studentId,
        lastActivity: matchedStudent ? matchedStudent.lastActivity : null,
      };
    });

    try {
      const response = await fetch(
        `/api/v1/classroom/${classroomId}/unenroll`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student: updateStudentListBuilder,
            studentId: studentId,
          }),
        }
      );
      if (response.status === 200) {
        toast({
          title: tu("toast.successUnenrollment"),
          description: tu("toast.successUnenrollDescription"),
        });
      } else {
        console.log("remove failed with status: ", response.status);
        toast({
          title: tu("toast.errorUnenrollment"),
          description: tu("toast.errorUnenrollDescription"),
          variant: "destructive",
        });
      }

      return new Response(
        JSON.stringify({
          message: "success",
        }),
        { status: 200 }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          message: error,
        }),
        { status: 500 }
      );
    } finally {
      router.refresh();
    }
  };

  const columns: ColumnDef<Classroom>[] = [
    {
      accessorKey: "classroomName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tu("className")}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="captoliza ml-4" onClick={() => row.toggleSelected}>
          {row.getValue("classroomName") || "Unknown"}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <Button variant="ghost">{tu("unEnroll")}</Button>;
      },
      cell: ({ row }) => (
        <div className="captoliza ml-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={() => {
              setClassroomId(row.getValue("id"));
              row.toggleSelected();
            }}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: enrolledClasses,
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
      <div className="font-bold text-3xl">
        {tu("title", {
          studentName: matchedNameOfStudents[0]
            ? matchedNameOfStudents[0].name
            : "Unknown",
        })}
      </div>
      <div className="flex items-center justify-between">
        <Input
          placeholder={tu("search")}
          value={
            (table.getColumn("classroomName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("classroomName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
        <Button
          variant="default"
          className="max-w-sm mt-4"
          onClick={() =>
            handleStudentUnEnrollment(classroomId, enrolledClasses, studentId)
          }
        >
          {tu("remove")}
        </Button>
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
