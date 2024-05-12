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

type MyRosterProps = {
  studentInClass: Student[];
};

export default function ClassRoster({ studentInClass }: MyRosterProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  let action = "";

  const closeDialog = () => {
    setIsOpen(false);
  };

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
            Name
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
        return <Button variant="ghost">Last Activity</Button>;
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
        return <Button variant="ghost">Action</Button>;
      },
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="ml-auto">
              Actions <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              onClick={() =>
                handleActionSelected("progress", row.getValue("studentId"))
              }
            >
              <Link href={redirectUrl}>Progress</Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              onClick={() =>
                handleActionSelected("enroll", row.getValue("studentId"))
              }
            >
              <Link href={redirectUrl}>Enroll</Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              onClick={() => openResetModal(row.getValue("studentId"))}
            >
              Reset Progress
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
              <DialogTitle>Reset all XP progress</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to reset all progress?
            </DialogDescription>
            <DialogFooter>
              <Button variant="outline" onClick={() => closeResetModal()}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleResetProgress(selectedStudentId ?? "")}
              >
                Reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {studentInClass.length > 0 ? (
        <div className="font-bold text-3xl">
          Roster for classroom : {studentInClass[0].classroomName}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
        <Header heading="No student in this class" />
         Please select class from My Classes
      </div>
      )}
      <div className="flex justify-between">
        <Input
          placeholder={"Search..."}
          value={
            (table.getColumn("studentName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
        <div className="max-w-sm mt-4">
              <Link href={studentInClass && studentInClass.length > 0 ? `/teacher/class-roster/${studentInClass[0].classroomId}/create-new-student`: '#'}>
            <Button variant="outline">
              <Icons.add />
              &nbsp; Add new students
            </Button>
              </Link>
      </div>
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
