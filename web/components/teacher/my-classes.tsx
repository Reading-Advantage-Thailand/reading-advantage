"use client";
import React, { useEffect, useState } from "react";
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
import CreateNewClass from "./create-new-class";
import EditClass from "./edit-class";
import { useNavigate } from "react-router-dom";
import { set } from "lodash";

type Classes = {
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
};

type MyClassesProps = {
  userId: string;
  classrooms: Classes[];
};
export default function MyStudents({ userId, classrooms }: MyClassesProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  let action = "";

  const closeDialog = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }, [selectedStudentId, action, redirectUrl, router]);

  const handleActionSelected = (action: string, id: string) => {
    switch (action) {
      case "edit":
        setShowEditModal(true);
        break;
      case "roster":
        setRedirectUrl(`/teacher/class-roster/${id}`);
        break;
      case "reports":
        setRedirectUrl(`/teacher/reports`);
        break;
      case "archive":
        setShowArchiveModal(true);
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
  const handleClassroomClick = (classroomName: string) => {
    router.push(`/teacher/class-roster/${classroomName}`);
  };

  const columns: ColumnDef<Classes>[] = [
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
      cell: ({ row }) => {
        return <div className="captoliza">{row.getValue("classroomName")}</div>;
      },
    },
    {
      accessorKey: "classCode",
      header: ({ column }) => {
        return <Button variant="ghost">Class Code</Button>;
      },
      cell: ({ row }) => (
        <div className="captoliza">{row.getValue("classCode")}</div>
      ),
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return null;
      },
      cell: ({ row }) => <div className="captoliza"></div>,
    },
    {
      accessorKey: "noOfStudents",
      header: ({ column }) => {
        return <Button variant="ghost">No. of Students</Button>;
      },
      cell: ({ row }) => (
        <div className="captoliza">{row.getValue("noOfStudents")}</div>
      ),
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
            <DropdownMenuCheckboxItem>
              <Link
                href={redirectUrl}
                onClick={() => handleActionSelected("edit", row.getValue("id"))}
              >
                Edit
              </Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <Link
                href={redirectUrl}
                onClick={() =>
                  handleActionSelected("roster", row.getValue("id"))
                }
              >
                Roster
              </Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <Link
                href={redirectUrl}
                onClick={() =>
                  handleActionSelected("reports", row.getValue("id"))
                }
              >
                Reports
              </Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <Link
                href={redirectUrl}
                onClick={() =>
                  handleActionSelected("archive", row.getValue("id"))
                }
              >
                Archive Class
              </Link>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: classrooms,
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
    {showEditModal && (
        <EditClass
          userId={userId}
          classroomData={classrooms}
          title="Edit Class"
        />
      )}

      <div className="font-bold text-3xl">My Classes</div>
      <div className="flex justify-between">
        <Input
          placeholder={"Search..."}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mt-4"
        />
        <CreateNewClass userId={userId} />
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
                    <TableCell
                      key={cell.id}
                      onClick={() => {
                        setSelectedStudentId(
                          cell.getContext().cell.row.getValue("id")
                        );
                        handleClassroomClick(
                          cell.getContext().cell.row.getValue("id")
                        );
                      }}
                    >
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
