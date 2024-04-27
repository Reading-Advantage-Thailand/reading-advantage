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
// import { Link } from "react-router-dom";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  email: string;
  name: string;
};

type MyStudentProps = {
  userId: string;
 matchedStudents: Student[];
};



// export const columns: ColumnDef<Student>[] = [

//   {
//     accessorKey: "name",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Name
//           <CaretSortIcon className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => <div className="captoliza" onClick={() => row.toggleSelected}>{row.getValue("name")}</div>,
//   },
//   {
//     accessorKey: "email",
//     header: ({ column }) => {
//       return <Button variant="ghost">Email</Button>;
//     },
//     cell: ({ row }) => <div className="captoliza">{row.getValue("email")}</div>,
//   },
//   {
//     accessorKey: "action",
//     header: ({ column }) => {
//       return <Button variant="ghost">Action</Button>;
//     },
//     cell: ({ row }) => (
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="default" className="ml-auto">
//             Actions <ChevronDownIcon className="ml-2 h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="start">
//           <DropdownMenuCheckboxItem >
//             <Link href={`/teacher/student-progress?studenId=${selectedStudentId}`}>Progress</Link>
//             </DropdownMenuCheckboxItem>
//           <DropdownMenuCheckboxItem >
//           <Link href=''>Enroll</Link>
//             </DropdownMenuCheckboxItem>
//           <DropdownMenuCheckboxItem >
//           <Link href=''>Unenroll</Link>
//             </DropdownMenuCheckboxItem>
//           <DropdownMenuCheckboxItem >
//           Reset Progress
//             </DropdownMenuCheckboxItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     ),
//   },
// ];

export default function MyStudents({
  userId,
  matchedStudents,
}: MyStudentProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const t = useScopedI18n("components.articleRecordsTable");
  const [selectedStudentId, setSelectedStudentId] = useState( null );  
console.log('selectedStudentId', selectedStudentId);
const router = useRouter(); 

useEffect(() => {
  if (selectedStudentId) {
    router.push(`/teacher/student-progress/${selectedStudentId}`);
  }
}, [selectedStudentId]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
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
      cell: ({ row }) => <div className="captoliza" onClick={() => row.toggleSelected}>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return <Button variant="ghost">Email</Button>;
      },
      cell: ({ row }) => <div className="captoliza">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "id",
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
            <DropdownMenuCheckboxItem>
              <Link href={`/teacher/student-progress/${selectedStudentId}`}>Progress</Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem >
              <Link href=''>Enroll</Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem >
              <Link href=''>Unenroll</Link>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem >
              Reset Progress
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
      <div className="font-bold text-3xl">My Students Page</div>
      {/* <CreateNewStudent userId={userId}/> */}
      <Input
        placeholder={"Search..."}
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm mt-4"
      />
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader className="font-bold">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableCell>
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
                  // onClick={() => setSelectedStudentId(row.getValue('id'))}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}
                    onClick={() => setSelectedStudentId(cell.getContext().cell.row.getValue('id'))}
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
