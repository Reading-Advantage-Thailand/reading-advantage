"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
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
import { Checkbox, Radio, TableHead } from "@mui/material";
import { Input } from "@/components/ui/input";
import { useScopedI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import axios from "axios";

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
  studentId: string;
  matchedStudents: Student[];
};

export default function MyEnrollClasses({
  enrolledClasses,
  studentId,
  matchedStudents,
}: MyEnrollProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const router = useRouter();
  const [classroomId, setClassroomId] = useState("");
  const [isCheck, setIsCheck] = useState(false);
  const [studentInClassVar, setStudentInClassVar] = useState<String[]>([]);

  const eachClassChecked = useCallback((id: string) => {
    if (isCheck) {
      setStudentInClassVar(["classId_" + id]);
    }
  }, [isCheck, setStudentInClassVar]);

  useEffect(() => {
    eachClassChecked(classroomId);
  }, [isCheck, classroomId, eachClassChecked]);


  const handleStudentEnrollment = async (id: string, enrolledClasses: any) => {
    let studentInClass: any[] = [];
    enrolledClasses.forEach((enrolledClass: any) => {
      enrolledClass.student.forEach((student: { studentId: string }) => {
        if (enrolledClass.id === id) {
          studentInClass.push(student.studentId);
        }
        if (!studentInClass.includes(studentId)) {
          studentInClass.push(studentId);
        }
      });
    });
    const updateStudentListBuilder = studentInClass.map((studentId) => ({
      studentId,
    }));

    try {
      const response = await axios.patch(`/api/classroom/${id}`, {
        teacherId: enrolledClasses[0].teacherId,
        classCode: enrolledClasses[0].classCode,
        classroomName: enrolledClasses[0].classroomName,
        coTeacher: "",
        description: enrolledClasses[0].description,
        grade: enrolledClasses[0].grade,
        noOfStudents: enrolledClasses[0].noOfStudents,
        student: updateStudentListBuilder,
        title: enrolledClasses[0].title,
      });

      if (response.status === 200) {
        console.log("add success");
      } else {
        console.log("add failed with status: ", response.status);
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
            Class Name
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="captoliza" onClick={() => row.toggleSelected}>
          {row.getValue("classroomName")}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <Button variant="ghost">Enroll</Button>;
      },
      cell: ({ row }) => (
        <div className="captoliza">
          <Checkbox
            checked={row.getIsSelected()}
            onChange={() => {
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
        Enrolled Classes for {matchedStudents[0].name}
      </div>
      <div className="flex items-center justify-between">
        <Input
          placeholder={"Search..."}
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
          onClick={() => handleStudentEnrollment(classroomId, enrolledClasses)}
        >
          Add
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
