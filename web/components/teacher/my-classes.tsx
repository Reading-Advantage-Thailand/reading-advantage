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

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "../ui/use-toast";
import axios from "axios";
import db from "@/configs/firestore-config";
import { orderBy } from "@firebase/firestore";
import firebase from "firebase/app";
import "firebase/firestore";
import CreateNewClass from "./create-new-class";

// interface Classroom {
//   Class_name: string;
//   Class_code: string;
//   No_of_student: number;
//   Grade: string;
//   Co_teachers: string;
//   Actions: string[];
//   Class_header: string[];
// }

// export async function getServerSideProps() {
//   let classrooms: never[] = [];
//   let error = '';
//   const res = await fetch("http://localhost:3000/api/classrooms", {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
//   .then((res) => res.json())
//   .then(data => {
//     if (data.message === 'success') {
//       classrooms = data.data;
//       console.log('classrooms', classrooms);

//     } else {
//       error = data.message;
//       console.error(data.message);
//     }
//   })
//   .catch(error => {
//     console.error('Network error', error);
//   })

//   return {
//     props: {
//       classrooms,
//       error
//     },
//   };
// };

type resClassroom = {
  classroomName: string;
  classCode: string;
  noOfStudent: number;
  grade: string;
  coTeacher: {
    coTeacherId: string;
    name: string;
  };
};

type MyClassesProps = {
  classrooms: resClassroom[];
};

export default async function MyClasses({ classrooms }: MyClassesProps) {
  console.log("classrooms", classrooms);

  const [tableClassroom, setTableClassroom] = useState([]);

  const tableClassroomHeader = [
    "Class Name",
    "Class Code",
    "No.of Students",
    "Actions",
  ];
  const actions = ["Edit", "Roster", "Report", "Archive Class"];
 
  return (
    <>
      <div className="flex justify-between">
        <div className="font-bold text-3xl">My Classroom</div>
        <CreateNewClass />
      </div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader className="font-bold">
            <TableRow className="bg-muted/50">
              {tableClassroomHeader.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.map((classroom, index) => (
              <TableRow key={index}>
                <TableCell>{classroom.classroomName}</TableCell>
                <TableCell>{classroom.classCode}</TableCell>
                <TableCell>{classroom.noOfStudent}</TableCell>
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
