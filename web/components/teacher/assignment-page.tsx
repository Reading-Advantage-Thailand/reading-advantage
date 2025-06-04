"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { toast } from "@/components/ui/use-toast";
import { useClassroomStore } from "@/store/classroom-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Assignment = {
  articleId: string;
  meta: {
    title: string;
    description: string;
    dueDate: string;
    classroomId: string;
    articleId: string;
    userId: string;
    createdAt: string;
  };
  students: {
    id: string;
    displayName: string;
    studentId: string;
    status: number | string;
  }[];
};

export default function Assignments() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const t = useScopedI18n("components.articleRecordsTable");
  const ta = useScopedI18n("pages.teacher.AssignmentPage");
  const { classrooms, fetchClassrooms } = useClassroomStore();
  const [searchTerm, setSearchTerm] = useState("");

  const columns: ColumnDef<Assignment>[] = [
    {
      id: "title", // เพิ่ม id เพื่อให้อ้างอิงได้
      accessorFn: (row) => row.meta.title, // ใช้ accessorFn แทน accessorKey
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {ta("assignment")}
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="ml-4">{row.original.meta.title}</div>,
    },
    {
      accessorKey: "meta.createdAt",
      header: () => <div className="text-center">{ta("createdOn")}</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {new Date(row.original.meta.createdAt).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "meta.dueDate",
      header: () => <div className="text-center">{ta("dueDate")}</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {new Date(row.original.meta.dueDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "students",
      header: () => <div className="text-center">{ta("students")}</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.students.length}</div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">{ta("actions")}</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="ml-auto">
                {ta("actions")} <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => {
                  router.push(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/teacher/assignments/${row.original.meta.classroomId}/${row.original.meta.articleId}`
                  );
                }}
              >
                {ta("details")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const fetchAssignments = async (classroomId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/assignments?classroomId=${classroomId}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = async (value: string) => {
    try {
      setIsLoading(true);
      setSelectedClassroom(value);
      await fetchAssignments(value);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const column = table.getColumn("title");
    if (column) {
      column.setFilterValue(searchTerm);
    }
  }, [searchTerm, table]);
  useEffect(() => {
    setSearchTerm("");
  }, [selectedClassroom]);

  useEffect(() => {
    const init = async () => {
      if (!classrooms.length) {
        await fetchClassrooms();
      }

      const pathSegments = pathname.split("/");
      const currentClassroomId = pathSegments[3];

      if (
        currentClassroomId &&
        classrooms.some((c) => c.id === currentClassroomId)
      ) {
        setSelectedClassroom(currentClassroomId);
        await fetchAssignments(currentClassroomId);
      }
    };

    init();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Header heading={ta("assignment")} />
        <Select value={selectedClassroom} onValueChange={handleClassChange}>
          <SelectTrigger className="mt-4 h-auto w-[180px]">
            <SelectValue placeholder="Select a Classroom" />
          </SelectTrigger>
          <SelectContent className="max-h-48 overflow-y-auto">
            {classrooms?.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.classroomName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center">
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          className="max-w-sm"
          disabled={!selectedClassroom || isLoading}
        />
      </div>

      <div className="rounded-md border">
        <Table style={{ tableLayout: "fixed", width: "100%" }}>
          <TableHeader className="font-bold">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {selectedClassroom ? (
              isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-6 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[120px] mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[100px] mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[60px] mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-[100px] mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
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
                    No assignments found
                  </TableCell>
                </TableRow>
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Please select a classroom to view assignments
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
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
