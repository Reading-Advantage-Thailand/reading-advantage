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
import { Header } from "../header";
import { useScopedI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "../ui/use-toast";

type Student = {
  id: string;
  email: string;
  name: string;
};

type MyStudentProps = {
  matchedStudents: Student[];
};

export default function MyStudents({ matchedStudents }: MyStudentProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const ts = useScopedI18n("components.myStudent");
  const router = useRouter();
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

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
      if (response.status === 400) {
        toast({
          title: "Fail.",
          description: `XP reset Fail.`,
        });
      }

      if (response.status === 200) {
        toast({
          title: "Success.",
          description: `XP reset successfully.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Fail.",
        description: `XP reset Fail.`,
      });
    } finally {
      router.refresh();
      setIsResetModalOpen(false);
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "display_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {ts("name")}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const studentName: string = row.getValue("display_name");
        return (
          <div className="captoliza ml-4">
            {studentName ? studentName : "Anonymous"}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: () => {
        return <div>{ts("email")}</div>;
      },
      cell: ({ row }) => {
        const studentEmail: string = row.getValue("email");
        return (
          <div className="captoliza ">
            {studentEmail ? studentEmail : "Unknown"}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => {
        return <div className="text-center">{ts("actions")}</div>;
      },
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="ml-auto">
                  {ts("actions")} <ChevronDownIcon className="ml-2 h-4 w-4" />
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
                  onClick={() =>
                    router.push(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/teacher/unenroll-classes/${payment.id}`
                    )
                  }
                >
                  {ts("unEnroll")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setSelectedStudentId(payment.id);
                  }}
                >
                  {ts("resetProgress")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: matchedStudents,
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
        <Header heading={ts("title")} />
        <Input
          placeholder={ts("searchName")}
          value={
            (table.getColumn("display_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("display_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm "
        />
        <div className="rounded-md border ">
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
      <Dialog
        open={isResetModalOpen}
        onOpenChange={() => setIsResetModalOpen(!isResetModalOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts("resetTitle")}</DialogTitle>
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
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
