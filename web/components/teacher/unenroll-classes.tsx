"use client";
import React, { useEffect, useState } from "react";
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
import { useParams, useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { Header } from "../header";

type Student = {
  id: string;
  email: string;
  display_name: string;
};

type StudentInClass = {
  studentId: string;
  lastActivity: string;
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
  student: StudentInClass[];
  archived: boolean;
  teacherId: string;
};

type MyEnrollProps = {
  classroom: Classroom[];
  student: Student;
};

export default function MyUnEnrollClasses() {
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
  const params = useParams();
  const [data, setData] = useState<MyEnrollProps>();

  const handleStudentUnEnrollment = async (classroomId: string[]) => {
    if (classroomId.length === 0) {
      toast({
        title: tu("toast.errorUnenrollment"),
        description: tu("toast.errorUnenrollDescription"),
        variant: "destructive",
      });
      return;
    }
    for (const classId of classroomId) {
      const studentDelete = data?.classroom
        .find((classroom: Classroom) => classroom.id === classId)
        ?.student.filter(
          (student: StudentInClass) => student.studentId !== params.studentId
        );

      try {
        const response = await fetch(`/api/v1/classroom/${classId}/unenroll`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student: studentDelete,
          }),
        });
        if (!response.ok) {
          toast({
            title: tu("toast.errorUnenrollment"),
            description: tu("toast.errorUnenrollDescription"),
            variant: "destructive",
          });
        } else {
          setData((prevData) => {
            const safePrevData = prevData ?? {
              classroom: [],
              student: {} as Student,
            };

            return {
              ...safePrevData,
              classroom: safePrevData.classroom.filter(
                (classroom: Classroom) => classroom.id !== classId
              ),
            };
          });
        }
      } catch (error) {
        toast({
          title: tu("toast.errorUnenrollment"),
          description: tu("toast.errorUnenrollDescription"),
          variant: "destructive",
        });
      } finally {
        toast({
          title: tu("toast.successUnenrollment"),
          description: tu("toast.successUnenrollDescription"),
        });
        router.refresh();
        setRowSelection({});
      }
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
      header: () => {
        return <div className="text-center">{tu("unEnroll")}</div>;
      },
      cell: ({ row }) => (
        <div className="captoliza text-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.classroom || [],
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

  useEffect(() => {
    const fetchData = async () => {
      await fetch(
        `/api/v1/classroom/students/unenroll?studentId=${params.studentId}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch data");
          }
          return res.json();
        })
        .then((res) => setData(res));
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Header
        heading={tu("title", {
          studentName: data ? data.student?.display_name : "Unknown",
        })}
      />
      <div className="flex items-center justify-between">
        <Input
          placeholder={tu("search")}
          value={
            (table.getColumn("classroomName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("classroomName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant="default"
          className="max-w-sm"
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rowsById;
            const fileIds = Object.values(selectedRows).map(
              (row) => row.original.id
            );
            handleStudentUnEnrollment(fileIds);
          }}
        >
          {tu("remove")}
        </Button>
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
  );
}
