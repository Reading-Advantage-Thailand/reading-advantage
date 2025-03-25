"use client";
import React, { useState, useEffect } from "react";
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
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icons } from "@/components/icons";
import { Header } from "@/components/header";
import { toast } from "../ui/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { useClassroomState, useClassroomStore } from "@/store/classroom-store";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StudentData = {
  id: string;
  display_name: string;
  email: string;
  last_activity: string;
};

interface Classes {
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
  importedFromGoogle: boolean;
  alternateLink: string;
  googleClassroomId: string;
}

export default function ClassRoster() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const tr = useScopedI18n("components.classRoster");
  const ts = useScopedI18n("components.myStudent");
  const router = useRouter();
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { classrooms, fetchClassrooms } = useClassroomStore();
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const {
    classes,
    selectedClassroom,
    studentInClass,
    setClasses,
    setSelectedClassroom,
    setStudentInClass,
  } = useClassroomState();

  const handleResetProgress = async (selectedStudentId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${selectedStudentId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            xp: 0,
            level: 0,
            cefr_level: "",
          }),
        }
      );
      if (!response.ok) {
        toast({
          title: "Fail.",
          description: `XP reset Fail.`,
        });
      }
    } catch (error) {
      toast({
        title: "Fail.",
        description: `XP reset Fail.`,
      });
    } finally {
      toast({
        title: "Success.",
        description: `XP reset successfully.`,
      });
      router.refresh();
      setIsResetModalOpen(false);
    }
  };

  const columns: ColumnDef<StudentData>[] = [
    {
      accessorKey: "display_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tr("name")}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="captoliza ml-4">{row.getValue("display_name")}</div>
      ),
    },
    {
      accessorKey: "last_activity",
      header: () => {
        return <div className="text-center">{tr("lastActivity")}</div>;
      },
      cell: ({ row }) => {
        return (
          <div className="captoliza text-center">
            {row.getValue("last_activity")
              ? new Date(row.getValue("last_activity")).toLocaleString()
              : "No Activity"}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => {
        return <div className="text-center">{tr("actions")}</div>;
      },
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="ml-auto">
                  {tr("actions")} <ChevronDownIcon className="ml-2 h-4 w-4" />
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
                  {ts("progress")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/teacher/enroll-classes/${payment.id}`
                    )
                  }
                >
                  {ts("enroll")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setSelectedStudentId(payment.id);
                  }}
                >
                  {ts("resetProgress")}
                </DropdownMenuItem>
                {classrooms && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `${process.env.NEXT_PUBLIC_BASE_URL}//teacher/class-roster/${classrooms[0]?.id}/history/${payment.id}`
                      )
                    }
                  >
                    {tr("history")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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

  const syncStudents = async (courseId: string) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/v1/classroom/oauth2/classroom/courses/${courseId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Students synced successfully",
        });
      } else {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const pathSegments = pathname.split("/");
    const currentClassroomId = pathSegments[4];
    if (classrooms.some((c) => c.id === currentClassroomId)) {
      setSelectedClassroom(currentClassroomId);
      fetchStudentInClass(currentClassroomId);
    }
    if (!currentClassroomId) {
      setClasses({} as Classes);
      setSelectedClassroom("");
      setStudentInClass([]);
    }
  }, [pathname, classrooms]);

  useEffect(() => {
    if (!classrooms.length) {
      fetchClassrooms();
    }
  }, []);

  const fetchStudentInClass = async (classId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom/${classId}`,
        {
          method: "GET",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch Classroom list");

      const data = await res.json();
      setStudentInClass(data.studentInClass);
      setClasses(data.classroom);
    } catch (error) {
      console.error("Error fetching Classroom list:", error);
    }
  };

  const handleClassChange = async (value: string) => {
    try {
      setSelectedClassroom(value);

      await fetchStudentInClass(value);
      router.push(`/teacher/class-roster/${value}`);
    } catch (error) {
      console.error("Error fetching Classroom list:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Header heading="Class Roster" />
        <Select value={selectedClassroom} onValueChange={handleClassChange}>
          <SelectTrigger className="mt-4 w-[180px]">
            <SelectValue placeholder="Select a Classroom" />
          </SelectTrigger>
          <SelectContent className="min-h-fit h-44 ">
            {classrooms?.map((classroom, index) => (
              <SelectItem key={index} value={classroom.id}>
                {classroom.classroomName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {classes &&
        (studentInClass.length ? (
          <Header heading={tr("title", { className: classes.classroomName })} />
        ) : (
          <Header heading={tr("noStudent")} />
        ))}
      <div className="flex justify-between items-center">
        <Input
          placeholder={tr("search")}
          value={
            (table.getColumn("display_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("display_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {selectedClassroom &&
          (!classes.importedFromGoogle ? (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/teacher/class-roster/${classes.id}/create-new-student`
                )
              }
            >
              <Icons.add />
              {tr("addStudentButton")}
            </Button>
          ) : (
            <Button
              onClick={() => syncStudents(classes.googleClassroomId)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Sync students
                </>
              ) : (
                <>
                  <Image
                    className="mr-2"
                    src={"/96x96_yellow_stroke_icon@1x.png"}
                    alt="google-classroom"
                    width={20}
                    height={20}
                  />
                  Sync students
                </>
              )}
            </Button>
          ))}
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
      <Dialog
        open={isResetModalOpen}
        onOpenChange={() => setIsResetModalOpen(!isResetModalOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts("resetTitle")}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{ts("resetDescription")}</DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetModalOpen(false)}
            >
              {ts("cancelReset")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleResetProgress(selectedStudentId)}
            >
              {ts("reset")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
