"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { table } from "console";
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
import { ChevronDownIcon } from "@radix-ui/react-icons";

export default function Reports() {
  const tableHeader = ["Student", "Last Activity", "Actions"];
  const tableBody = [
    {
      Name: "Student 1",
      Email: "2024-01-06 14:00",
      Actions: ["Report", "Enroll", "Reset Progress"],
    },
    {
      Name: "Student 2",
      Email: "2024-01-06 09:30",
      Actions: ["Report", "Enroll", "Reset Progress"],
    },
    {
      Name: "Student 3",
      Email: "2024-01-05 16:45",
      Actions: ["Report", "Enroll", "Reset Progress"],
    },
  ];

  return (
    <>
      <div className="font-bold text-3xl">Report for : Class Name</div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader className="font-bold">
            <TableRow className="bg-muted/50">
              {tableHeader.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableBody.map((body, index) => (
              <TableRow key={index}>
                <TableCell>{body.Name}</TableCell>
                <TableCell>{body.Email}</TableCell>
                <TableCell>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="default" className="ml-auto">
                          Actions <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {body.Actions.map((action, index) => {
                          return (
                            <DropdownMenuCheckboxItem>
                              {action}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
