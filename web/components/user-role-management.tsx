"use client";

import * as React from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export type Payment = {
  id: string;
  name: string;
  email: string;
  role: string;
  license_id: string;
};

export default function UserRoleManagement({
  data,
  page,
}: {
  data: Payment[];
  page: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<string>();
  const [email, setEmail] = React.useState<string>();
  const [currentPayment, setCurrentPayment] = React.useState<Payment>();
  const router = useRouter();
  const licenseIds = data.map((item) => item.license_id);

  const handleEditClick = (payment: Payment) => {
    setCurrentPayment(payment);
    setSelectedRole(payment.role);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${currentPayment?.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: selectedRole }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update role.");
      }

      if (response.status === 200) {
        toast({
          title: "Role updated.",
          description: `Changed role to ${selectedRole}.`,
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      router.refresh();
    }
  };

  const handleAddSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users`,
        {
          method: "PATCH",
          body: JSON.stringify({
            email: email,
            role: selectedRole,
            license_id: licenseIds,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        toast({
          title: "Error Alert.",
          description: `${data.message}.`,
          variant: "destructive",
        });
      }

      if (response.status === 200) {
        toast({
          title: "User added.",
          description: `Added user with email ${email} and role ${selectedRole}.`,
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      router.refresh();
    }
  };

  const role =
    page === "system"
      ? [
          { name: "Student", value: "student" },
          { name: "Teacher", value: "teacher" },
          { name: "Admin", value: "admin" },
          { name: "system", value: "system" },
        ]
      : [
          { name: "Student", value: "student" },
          { name: "Teacher", value: "teacher" },
          { name: "Admin", value: "admin" },
        ];

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "name",
      header: "User Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: () => <div className="text-center">Current Role</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center">{row.getValue("role")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div>Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEditClick(payment)}>
                  Change Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
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
    initialState: {
      //This line
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search users..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          {page !== "system" && (
            <div className="flex-1 text-sm text-muted-foreground">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">Add User</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Add User</AlertDialogTitle>
                    <AlertDialogDescription>
                      <p>Email</p>
                      <Input
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email..."
                      />
                      <p>Role</p>
                      <Select onValueChange={(value) => setSelectedRole(value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {role.map((role, index) => (
                              <SelectItem key={index} value={role.value}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAddSubmit}>
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
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

      <AlertDialog
        open={isEditDialogOpen}
        onOpenChange={() => setIsEditDialogOpen(!isEditDialogOpen)}
      >
        <AlertDialogTrigger asChild></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Role</p>
              <Select
                defaultValue={currentPayment?.role}
                onValueChange={(value) => setSelectedRole(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {role.map((role, index) => (
                      <SelectItem key={index} value={role.value}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditSubmit}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
