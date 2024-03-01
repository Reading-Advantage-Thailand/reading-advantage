"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { table } from "console";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";

export default function MyClasses() {
  const tableHeader = ["Class Name", "Class Code", "No.of Students", "Actions"];
  const tableBody = [
    {
      Class_name: "Class 1",
      Class_code: "001",
      No_of_student: "23",
      Actions: ["Edit", "Roster", "Report", "Achive Class"],
    },
    {
      Class_name: "Class 2",
      Class_code: "002",
      No_of_student: "17",
      Actions: ["Edit", "Roster", "Report", "Achive Class"],
    },
    {
      Class_name: "Class 3",
      Class_code: "003",
      No_of_student: "20",
      Actions: ["Edit", "Roster", "Report", "Achive Class"],
    },
  ];

  return (
    <>
      <div className="font-bold text-3xl">My Classes Page</div>
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
                <TableCell>{body.Class_name}</TableCell>
                <TableCell>{body.Class_code}</TableCell>
                <TableCell>{body.No_of_student}</TableCell>
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
