"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
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
import { TableHead } from "@mui/material";
import { Input } from "@/components/ui/input";
import { useScopedI18n } from "@/locales/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Student = {
  studentId: string;
  lastActivity: {
    _seconds: number;
    _nanoseconds: number;
  };
  studentName: string;
  classroomName: string;
  classroomId: string;
  email: string;
};

type Classrooms = {
  id: string;
  classroomName: string;
  student: Student[];
};

type MyRosterProps = {
  studentInClass: Student[];
  classrooms: Classrooms[];
};

export default function ClassRoster({
  studentInClass,
  classrooms,
}: MyRosterProps) {
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
  const [isOpen, setIsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classrooms | null>(
    null
  );

  let action = "";

  const closeDialog = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!hasRefreshed && studentInClass) {
      router.refresh();
      setHasRefreshed(true);
    }
  }, [studentInClass, hasRefreshed, router]);

  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }, [selectedStudentId, action, redirectUrl, router]);

  const handleActionSelected = (action: string, studentId: string) => {
    switch (action) {
      case "progress":
        setRedirectUrl(`/teacher/student-progress/${studentId}`);
        break;
      case "enroll":
        setRedirectUrl(`/teacher/enroll-classes/${studentId}`);
        break;
      case "history":
        setRedirectUrl(`/teacher/class-roster/history/${studentId}`);
        break;
      default:
        console.log("default");
        break;
    }
  };

  const openResetModal = (selectedStudentId: null) => {
    setIsResetModalOpen(true);
    setSelectedStudentId(selectedStudentId);
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
  };

  const handleResetProgress = async (selectedStudentId: string) => {
    closeResetModal();
    try {
      const response = await fetch(`/api/users/${selectedStudentId}`, {
        method: "PATCH",
        body: JSON.stringify({
          xp: 0,
          level: 0,
          cefrLevel: "",
        }),
      });
      toast({
        title: tr("toast.successResetProgress"),
        description: tr("toast.successResetProgressDescription"),
      });
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
      closeDialog();
      router.refresh();
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "studentName",
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
        <div className="captoliza ml-4">{row.getValue("studentName")}</div>
      ),
    },
    {
      accessorKey: "lastActivity",
      header: ({ column }) => {
        return <Button variant="ghost">{tr("lastActivity")}</Button>;
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
      accessorKey: "action",
      header: ({ column }) => {
        return <Button variant="ghost">{tr("actions")}</Button>;
      },
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="ml-auto">
              {tr("actions")} <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              onClick={() =>
                handleActionSelected("progress", row.getValue("studentId"))
              }
            >
              <Link href={redirectUrl}>{ts("progress")}</Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              onClick={() =>
                handleActionSelected("enroll", row.getValue("studentId"))
              }
            >
              <Link href={redirectUrl}>{ts("enroll")}</Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              onClick={() => openResetModal(row.getValue("studentId"))}
            >
              {ts("resetProgress")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
             onClick={() =>
              handleActionSelected("history", row.getValue("studentId"))
            }
            >
              {tr("history")}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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
      {isResetModalOpen && (
        <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ts("resetTitle")}</DialogTitle>
            </DialogHeader>
            <DialogDescription>{ts("resetDescription")}</DialogDescription>
            <DialogFooter>
              <Button variant="outline" onClick={() => closeResetModal()}>
                {ts("cancelReset")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleResetProgress(selectedStudentId ?? "")}
              >
                {ts("reset")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {classrooms.length ? (
        studentInClass.length ? (
          <div className="font-bold text-3xl">
            {tr("title", { className: studentInClass[0].classroomName })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Header heading={tr("noStudent")} />
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <Header heading={tr("noClassroom")} />
          {tr("noClassroomDescription")}
        </div>
      )}

      <div className="flex justify-between">
        <Input
          placeholder={tr("search")}
          value={
            (table.getColumn("studentName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
        {classrooms.length > 0 ? (
          <Link
            href={`/teacher/class-roster/${classrooms[0].id}/create-new-student`}
          >
            <Button variant="outline">
              <Icons.add />
              &nbsp; {tr("addStudentButton")}
            </Button>
          </Link>
        ) : (
          ""
        )}
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
