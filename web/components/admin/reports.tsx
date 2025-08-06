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
import { useScopedI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, BookOpen, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import ClassroomXpComparisonChart from "./classroom-xp-comparison-chart";

type ClassroomData = {
  id: string;
  classroomName: string;
  classCode: string;
  grade: string;
  archived: boolean;
  title: string;
  importedFromGoogle: boolean;
  alternateLink: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  isOwner: boolean;
  teachers: Array<{
    teacherId: string;
    name: string;
    role: string;
    joinedAt: string;
  }>;
  student: Array<{
    studentId: string;
    email: string;
    lastActivity: string;
  }>;
  xpData?: {
    today: number;
    week: number;
    month: number;
    allTime: number;
  };
};

interface AdminReportsProps {
  classes: ClassroomData[];
}

export default function AdminReports({ classes }: AdminReportsProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("all");
  const [isClient, setIsClient] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  
  const t = useScopedI18n("components.articleRecordsTable");
  const trp = useScopedI18n("components.reports");
  const router = useRouter();

  // Fix hydration issue by rendering date only on client
  React.useEffect(() => {
    setIsClient(true);
    
    // Check if screen is mobile size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set column visibility based on screen size
  React.useEffect(() => {
    if (!isClient) return;
    
    if (isMobile) {
      // On mobile, only show classroomName, createdBy, and grade
      setColumnVisibility({
        classCode: false,
        student: false,
        createdAt: false,
        archived: false,
        actions: false, // Hide desktop actions since we show them in grade column
      });
    } else {
      // On desktop, show all columns
      setColumnVisibility({
        classCode: true,
        student: true,
        createdAt: true,
        archived: true,
        actions: true,
      });
    }
  }, [isMobile, isClient]);

  // Get unique teachers
  const teachers = Array.from(
    new Set(classes.map(classroom => classroom.createdBy.name).filter(Boolean))
  ) as string[];

  // Filter classrooms by selected teacher
  const filteredClasses = selectedTeacher === "all" 
    ? classes 
    : classes.filter(classroom => classroom.createdBy.name === selectedTeacher);

  const columns: ColumnDef<ClassroomData>[] = [
    {
      accessorKey: "classroomName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Classroom Name
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium ml-6 sm:ml-4">
          <div>{row.getValue("classroomName")}</div>
          {/* Show additional info on mobile */}
          {isMobile && (
            <div className="text-xs text-muted-foreground mt-1">
              <div>Code: {row.getValue("classCode")}</div>
              <div>{(row.getValue("student") as ClassroomData["student"])?.length || 0} students</div>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "classCode",
      header: "Code",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("classCode")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Teacher",
      cell: ({ row }) => {
        const createdBy = row.getValue("createdBy") as ClassroomData["createdBy"];
        return (
          <div>
            <div className="font-medium">{createdBy?.name || "N/A"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => (
        <div>
          <Badge variant="secondary">
            Grade {row.getValue("grade")}
          </Badge>
          {/* Show mobile actions */}
          {isMobile && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/reports/${row.original.id}`)}
                className="w-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Report
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "student",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Users className="mr-2 h-4 w-4" />
            Students
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const students = row.getValue("student") as ClassroomData["student"];
        return (
          <div className="text-center">
            {students?.length || 0}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        if (!isClient) {
          return <div className="text-sm">Loading...</div>;
        }
        
        const date = new Date(row.getValue("createdAt") as string);
        const formattedDate = format(date, "MMM dd, yyyy");
        return (
          <div className="text-sm">
            {formattedDate}
          </div>
        );
      },
    },
    {
      accessorKey: "archived",
      header: "Status",
      cell: ({ row }) => {
        const isArchived = row.getValue("archived") as boolean;
        return (
          <Badge variant={isArchived ? "destructive" : "default"}>
            {isArchived ? "Archived" : "Active"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const classroom = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/reports/${classroom.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Report
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredClasses,
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

  // Calculate summary statistics
  const totalClassrooms = filteredClasses.length;
  const totalStudents = filteredClasses.reduce((sum, classroom) => sum + (classroom.student?.length || 0), 0);
  const averageStudentsPerClass = filteredClasses.length > 0
    ? totalStudents / filteredClasses.length
    : 0;
  const activeClassrooms = filteredClasses.filter(classroom => !classroom.archived).length;

  return (
    <div className="space-y-6">
      <Header
        heading="Reports"
        text="View and analyze classroom performance across all licenses"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClassrooms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Students/Class</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStudentsPerClass.toFixed(1)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classrooms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClassrooms}</div>
          </CardContent>
        </Card>
      </div>

      {/* XP Comparison Chart */}
      <ClassroomXpComparisonChart classes={filteredClasses} />

      {/* Filters and Controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
          <Input
            placeholder="Filter classrooms..."
            value={(table.getColumn("classroomName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("classroomName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Teachers</SelectLabel>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher} value={teacher}>
                    {teacher}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {!isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      {column.getIsVisible() ? "✓" : ""} {column.id}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
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
                      No classrooms found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} classroom(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
