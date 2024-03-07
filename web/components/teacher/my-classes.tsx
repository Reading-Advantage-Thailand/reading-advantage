"use client";
import React, { useEffect, useState } from "react";
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
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
// import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Body {
    Class_name: string;
    Class_code: string;
    No_of_student: number;
    // Grade: string;
    // Co_teachers: string;
    Actions: string[];
    
}

export default function MyClasses() {
  const [className, setClassName] = useState("");
  const [grade, setGrade] = useState("0");
  const [coTeachers, setCoTeachers] = useState("");
  const [classCode, setClassCode] = useState("");
  const [noOfStudents, setNoOfStudents] = useState(0);
  const [open, setOpen] = useState(false);
  const [tableBody, setTableBody] = useState<Body[]>([]);

  const tableHeader = ["Class Name", "Class Code", "No.of Students", "Actions"];
 

  useEffect(() => {
    const savedData = localStorage.getItem("tableBody");
    setTableBody(savedData ? JSON.parse(savedData) : 
      [
          {
            Class_name: "Class 1",
            Class_code: "ariaVm",
            No_of_student: 22,
            Actions: ["Edit", "Roster", "Report", "Achive Class"],
          },
          {
            Class_name: "Class 2",
            Class_code: "tgypie",
            No_of_student: 17,
            Actions: ["Edit", "Roster", "Report", "Achive Class"],
          },
          {
            Class_name: "Class 3",
            Class_code: "3l17wz",
            No_of_student: 20,
            Actions: ["Edit", "Roster", "Report", "Achive Class"],
          },
        ]
    );
  }, []);

  const handleClickOpen = (
    className: string,
    grade: string,
    coTeachers: string,
    classCode: string,
    noOfStudents: number
  ) => {
    setOpen(true);
    setTableBody((prevTableBody: any) => [
      ...prevTableBody,
      {
        Class_name: className,
        Class_code: classCode,
        No_of_student: noOfStudents,
        // Grade: grade,
        // Co_teachers: coTeachers,
        Actions: ["Edit", "Roster", "Report", "Achive Class"],
      },
    ]);
    alert("Class created successfully");
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="font-bold text-3xl">My Classes</div>
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Icons.add />
                &nbsp; Create New Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Class</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Please enter a name for your new class
              </DialogDescription>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="Class name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="Class Code"
                value={classCode}
                onChange={() => setClassCode(generateRandomCode())}
                // Icon={Icons.refresh}
              />
              <select
                className="w-full border rounded-md p-2"
                name="grade"
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="0">Select Grade</option>
                <option value="1">grade 1</option>
                <option value="2">grade 2</option>
                <option value="3">grade 3</option>
              </select>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="Co-teachers"
                value={coTeachers}
                onChange={(e) => setCoTeachers(e.target.value)}
              />
              
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() =>
                    handleClickOpen(
                      className,
                      grade,
                      coTeachers,
                      classCode,
                      noOfStudents
                    )
                  }
                >
                  Create Class
                </Button>
                <Button onClick={handleClose}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
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
            {tableBody.map((body: Body, index: number) => (
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
