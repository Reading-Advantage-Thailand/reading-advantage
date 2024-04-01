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

export default function MyStudents() {
  const tableHeader = ["Name", "Email", "Actions"];
  const tableBody = [
    {
      Name: "Student 1",
      Email: "email_1@domain",
      Actions: ["Report", "Enroll", "Unenroll", "Reset Progress"],
    },
    {
      Name: "Student 2",
      Email: "email_2@domain",
      Actions: ["Report", "Enroll", "Unenroll", "Reset Progress"],
    },
    {
      Name: "Student 3",
      Email: "email_3@domain",
      Actions: ["Report", "Enroll", "Unenroll", "Reset Progress"],
    },
  ];

  return (
    <>
      <div className="font-bold text-3xl">My Students Page</div>
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
                            <DropdownMenuCheckboxItem key={index}>
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
