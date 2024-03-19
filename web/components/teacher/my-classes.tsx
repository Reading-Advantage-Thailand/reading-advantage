"use client";
import React, { useState } from "react";
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
import { ChevronDownIcon } from "@radix-ui/react-icons";
import CreateNewClass from "./create-new-class";
import { useRouter } from "next/navigation";
import EditClass from "./edit-class";
import ArchiveClass from "./archive-class";

type resClassroom = {
  classroomName: string;
  classCode: string;
  noOfStudents: number;
  grade: string;
  coTeacher: {
    coTeacherId: string;
    name: string;
  };
  id: string;
};

type MyClassesProps = {
  userId: string;
  classrooms: resClassroom[];
};

export default function MyClasses({ classrooms, userId }: MyClassesProps) {
  
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const tableClassroomHeader = [
    "Class Name",
    "Class Code",
    "No.of Students",
    "Details",
    "Actions",
  ];
  const actions = ["Roster", "Report"];

  const handleOnClickClassroom = () => {
    // console.log("clicked classroom");
     router.push('/teacher/class-roster')
  };
  const handleActionSelect = (action: string) => {
    switch (action) {
      case "Roster":
        router.push("/teacher/class-roster");
        // handleRosterIconClick();
        break;
      case "Report":
        router.push("/teacher/reports");
        // handleReportIconClick();
        break;
      default:
        break;
    }
  };
  // const handleReportIconClick = () => {
  //   router.push("/teacher/reports");
  // };

  // const handleRosterIconClick = () => {
  //   router.push("/teacher/class-roster");
  // };

  return (
    <>
      <div className="flex justify-between">
        <div className="font-bold text-3xl">My Classroom</div>
        <CreateNewClass userId={userId} />
      </div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader className="font-bold">
            <TableRow className="">
              {tableClassroomHeader.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.map((classroom, index) => (
              <TableRow key={index}>
                <TableCell
                  onClick={handleOnClickClassroom}
                  className="cursor-pointer"
                >
                  {classroom.classroomName}
                </TableCell>
                <TableCell>{classroom.classCode}</TableCell>
                <TableCell>{classroom.noOfStudents}</TableCell>
                <TableCell>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="default" className="ml-auto">
                          Details <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {actions.map((action, index) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={index}
                              onSelect={() => handleActionSelect(action)}
                            >
                              {action}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
                <TableCell className="flex gap-4">
                  <EditClass
                    userId={userId}
                    open={showEditDialog}
                    onClose={() => setShowEditDialog(false)}
                    classroomData={classroom} // Add the 'id' property here
                  />
                  <ArchiveClass
                    userId={userId}
                    open={showArchiveDialog}
                    onClose={() => setShowArchiveDialog(false)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
