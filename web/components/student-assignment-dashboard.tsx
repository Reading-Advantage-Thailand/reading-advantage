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
import { Input } from "@/components/ui/input";
import { Header } from "./header";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { enUS, th, zhCN, zhTW, vi } from "date-fns/locale";
import { useCurrentLocale } from "@/locales/client";
import { useScopedI18n } from "@/locales/client";

interface AssignmentProps {
  userId: string;
}

type Assignment = {
  id: string;
  classroomId: string;
  articleId: string;
  title: string;
  description: string;
  dueDate: string;
  status: number;
  createdAt: string;
  teacherId: string;
  displayName: string;
  completed?: boolean;
};

export default function StudentAssignmentTable({ userId }: AssignmentProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const locale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";
  const t = useScopedI18n("pages.student.assignmentPage");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("all");

  const getDateLocale = () => {
    switch (locale) {
      case "th":
        return th;
      case "cn":
        return zhCN;
      case "tw":
        return zhTW;
      case "vi":
        return vi;
      default:
        return enUS;
    }
  };

  const getDueDateStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return {
        status: "overdue",
        variant: "destructive" as const,
        text: `${t("overdue")}`,
      };
    } else if (daysDiff === 0) {
      return {
        status: "today",
        variant: "secondary" as const,
        text: `${t("dueToday")}`,
      };
    } else if (daysDiff <= 3) {
      return {
        status: "soon",
        variant: "outline" as const,
        text: `${t("daysLeft", { daysDiff: daysDiff })}`,
      };
    } else {
      return {
        status: "upcoming",
        variant: "default" as const,
        text: `${t("daysLeft", { daysDiff: daysDiff })}`,
      };
    }
  };

  const columns: ColumnDef<Assignment>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("assignmentTitle")}
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const title: string = row.getValue("title");
        const description = row.original.description;
        return (
          <div className="ml-4">
            <div className="font-medium">{title}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: () => {
        return <div className="text-center">{t("assignmentDescription")}</div>;
      },
      cell: ({ row }) => {
        const title: string = row.getValue("description");
        const description = row.original.description;
        return (
          <div className="flex justify-center">
            <div className="text-sm text-muted-foreground mt-1 text-center">
              {description}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {t("createAt")}
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const createdAt: string = row.getValue("createdAt");
        return (
          <div className="flex justify-center">
            <div className="text-sm">
              {format(new Date(createdAt), "MMM dd, yyyy", {
                locale: getDateLocale(),
              })}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {t("dueDate")}
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const dueDate: string = row.getValue("dueDate");
        const dueDateStatus = getDueDateStatus(dueDate);
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="font-medium">
              {format(new Date(dueDate), "MMM dd, yyyy", {
                locale: getDateLocale(),
              })}
            </div>
            {row.original.status !== 2 && (
              <Badge variant={dueDateStatus.variant} className="mt-1">
                {dueDateStatus.text}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => {
        return <div className="text-center">{t("status")}</div>;
      },
      cell: ({ row }) => {
        const assignment = row.original;
        const completionStatus = assignment.status;

        const getStatusIcon = (status: number) => {
          switch (status) {
            case 0:
              return "⏳";
            case 1:
              return "🔄";
            case 2:
              return "✅";
            default:
              return "⏳";
          }
        };

        const getStatusText = (status: number) => {
          switch (status) {
            case 0:
              return `${t("notFinished")}`;
            case 1:
              return `${t("inProgress")}`;
            case 2:
              return `${t("done")}`;
            default:
              return `${t("notFinished")}`;
          }
        };

        return (
          <div className="flex justify-center items-center gap-2">
            <span className="text-lg">{getStatusIcon(completionStatus)}</span>
            <span className="text-sm">{getStatusText(completionStatus)}</span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        if (filterValue === undefined) return true;
        return row.getValue(columnId) === filterValue;
      },
    },
    {
      accessorKey: "displayName",
      header: () => {
        return <div className="text-center">{t("assignedBy")}</div>;
      },
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("displayName")}</div>
      ),
    },
    {
      id: "actions",
      header: () => {
        return <div className="text-center">{t("linkToAssignment")}</div>;
      },
      cell: ({ row }) => {
        const assignment = row.original;
        return (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                (window.location.href = `/student/lesson/${assignment.articleId}`)
              }
            >
              {t("goToLesson")}
            </Button>
          </div>
        );
      },
    },
  ];

  const dueDateColumn = columns.find(
    (col) => "accessorKey" in col && col.accessorKey === "dueDate"
  );

  if (dueDateColumn) {
    dueDateColumn.filterFn = (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const dueDate = new Date(row.getValue(columnId) as string);
      const now = new Date();

      switch (filterValue) {
        case "overdue":
          return dueDate < now;
        case "today":
          return dueDate.toDateString() === now.toDateString();
        case "upcoming":
          return dueDate > now;
        default:
          return true;
      }
    };
  }

  const fetchAssignment = async () => {
    try {
      if (!userId) {
        console.error("Missing required studentId");
        return;
      }

      const response = await fetch(
        `/api/v1/users/assignments?studentId=${userId}`
      );
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAssignment()]);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const table = useReactTable({
    data: assignments,
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
    <div className="flex flex-col gap-4">
      <Header heading={t("assignments")} />
      <div className="flex justify-between items-end">
        <Input
          placeholder={t("searchAssignments")}
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-1 border rounded-md text-sm"
            value={statusFilter}
            onChange={(event) => {
              const value = event.target.value;
              setStatusFilter(value);
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? undefined : parseInt(value));
            }}
          >
            <option value="all">{t("allStatus")}</option>
            <option value="0">{t("notFinished")}</option>
            <option value="1">{t("inProgress")}</option>
            <option value="2">{t("done")}</option>
          </select>
          <select
            className="px-3 py-1 border rounded-md text-sm"
            value={dueDateFilter}
            onChange={(event) => {
              const value = event.target.value;
              setDueDateFilter(value);
              table
                .getColumn("dueDate")
                ?.setFilterValue(value === "all" ? undefined : value);
            }}
          >
            <option value="all">{t("allDueDates")}</option>
            <option value="overdue">{t("overdue")}</option>
            <option value="today">{t("dueToday")}</option>
            <option value="upcoming">{t("upcomming")}</option>
          </select>
        </div>
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
                  {loading ? "Loading assignments..." : "No assignments found"}
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
