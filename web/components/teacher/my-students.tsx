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
import CreateNewStudent from "./create-new-student";
import { getCurrentUser } from "@/lib/session";

type Student = {
  id: string;
email: string;
  name: string;
};

type Classroom = {
  teacherId: string;
  classroomName: string;
  student: {
    studentId: string;
  }[];
}

type MyStudentProps = {
  userId: string;
  allStudent: Student[];
  allClassroom: Classroom[];
};

export default function MyStudents({userId, allStudent, allClassroom}: MyStudentProps) {
console.log('all student: ', allStudent);
console.log('all classroom :', allClassroom);

  const tableHeader = ["Name", "Email", "Actions"];
  const actions = ['Progress', 'Report']

  
  return (
    <>
      <div className="font-bold text-3xl">My Students Page</div>
      {/* <CreateNewStudent userId={userId}/> */}
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
            {allClassroom.map((classroom, index) => {
              const studentsInClass = student.filter(student => student.teacherId === classroom.teacherId);
              return (
                <div key={index}>
                  <p>{classroom.teacherId}</p>
                </div>
              );
              
})}

            {allStudent.map((student: Student, index: number) => (
              <TableRow key={index}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="default" className="ml-auto">
                          Actions <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {actions.map((action, index) => {
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
