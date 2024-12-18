"use client";
import { licenseService } from "@/client/services/firestore-client-services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LicenseSubScriptionLevel } from "@/server/models/enum";
import { License } from "@/server/models/license";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

const apiDeleteLicense = async (id: string) => {
  await licenseService.licenses.deleteDoc(id);
};

const convertToReadableDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString(undefined, options);
};

export const columns: ColumnDef<License>[] = [
  {
    accessorKey: "school_name",
    header: "School name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("school_name")}</div>
    ),
  },
  {
    accessorKey: "total_licenses",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("total_licenses")}</div>,
  },
  {
    accessorKey: "used_licenses",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Used
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("used_licenses")}</div>,
  },
  {
    accessorKey: "subscription_level",
    header: "Subscription",
    cell: ({ row }) => (
      <Badge
        className={cn(
          row.getValue("subscription_level") === LicenseSubScriptionLevel.BASIC
            ? "bg-green-300"
            : row.getValue("subscription_level") ===
              LicenseSubScriptionLevel.ENTERPRISE
            ? "bg-blue-300"
            : "bg-red-300"
        )}
      >
        {row.getValue("subscription_level")}
      </Badge>
    ),
  },
  {
    accessorKey: "expiration_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expiration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{convertToReadableDate(row.getValue("expiration_date"))}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const license = row.original;
      //   const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                apiDeleteLicense(license.id);
                // router.refresh();
              }}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(license.key)}
            >
              Copy License Key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View license details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
