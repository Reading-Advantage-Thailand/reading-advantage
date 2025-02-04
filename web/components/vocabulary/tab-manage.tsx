"use client";
import * as React from "react";
import { toast } from "../ui/use-toast";
import { useScopedI18n } from "@/locales/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";

export type Vocabulary = {
  word: string;
  definition: string;
  createdAt: string;
  due: string;
  id: string;
};

type Props = {
  userId: string;
};

export default function VocabularyManageTab({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");

  const [vocabularies, setVocabularies] = React.useState<Vocabulary[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const getVocabularyData = async () => {
    // Later integrate Firebase or other data sources here.
    // For now, we simulate fetching data
    // const res = await fetch(`/api/v1/users/vocabularies/${userId}`);
    // const data = await res.json();
    // Simulating the data structure
    /*const data: Vocabulary[] = [
      {
        word: "Incredible",
        definition: "Impressively good or great",
        createdAt: "2025-02-04T08:30:00Z",
        due: "2025-02-10T08:30:00Z",
        id: "1",
      },
      {
        word: "Persist",
        definition: "To continue in an action despite difficulty",
        createdAt: "2025-02-01T08:30:00Z",
        due: "2025-02-05T08:30:00Z",
        id: "2",
      },
    ];
    setVocabularies(data);*/
  };

  React.useEffect(() => {
    getVocabularyData();
  }, []);

  const columns: ColumnDef<Vocabulary>[] = [
    {
      accessorKey: "word",
      header: "Word",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("word")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return <div>{new Date(createdAt).toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "due",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const due = row.getValue("due") as string;
        return <div>{new Date(due).toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "delete",
      header: "",
      cell: ({ row }) => {
        return (
          <Button
            className="ml-auto font-medium"
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: vocabularies,
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

  const handleDelete = async (id: string) => {
    try {
      // Replace with actual delete logic later.
      const updatedVocabularies = vocabularies.filter((item) => item.id !== id);
      setVocabularies(updatedVocabularies);
      toast({
        title: t("toast.success"),
        description: t("toast.successDescription"),
      });
    } catch (error) {
      console.log(error);
      toast({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="mt-5">
        <Header
          heading={t("savedVocabulary")}
          text={
            vocabularies.length === 0
              ? t("noSavedVocabulary")
              : t("savedVocabularyDescription", {
                  total: vocabularies.length,
                })
          }
        />
      </div>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder={"Search..."}
            value={(table.getColumn("word")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("word")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : typeof header.column.columnDef.header === "function"
                        ? header.column.columnDef.header(header.getContext())
                        : header.column.columnDef.header}{" "}
                      {/* Render header based on type */}
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
                        {cell.getValue() as React.ReactNode}
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
        <div className="flex items-center justify-end space-x-2 pt-4">
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
    </>
  );
}
