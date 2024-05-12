import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import React, { useState } from "react";
import { Icons } from "@/components/icons";
import axios from "axios";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

type Student = {
    studentId: string;
    lastActivity: Date;
    studentName: string;
    classroomName: string;
    classroomId: string;
    email: string;
    xp: number;
  };
  
  type MyStudentProps = {
    userId: string;
    studentInClass: Student[];
    studentIdSelected: string;
  };

export default function EditStudent ({studentInClass, userId, studentIdSelected}: MyStudentProps) {
    const [open, setOpen] = useState(false); 
    const router = useRouter();  
    const studentToEdit = studentInClass.find((student) => student.studentId === studentIdSelected);
  const [studentName, setStudentName] = useState(studentToEdit? studentToEdit.studentName : "");

  const handleEditStudent = async (studentId: string) => {
    setOpen(true);
    try {
      const editStudent = {
        name: studentName,
        studentId: studentId,
      };
      if (!userId || !studentName ) {
        toast({
          title: "Attention",
          description: "Please fill in information",
          variant: "destructive",
        })
        return;  
      } else {
        await axios.patch(`/api/classroom/students/${studentId}`, editStudent);
      }
    } catch (error) {
      console.error(error);
    }
    toast({
      title: "Update Successful",
      description: "Student information updated successfully",
      variant: "default",
    });
    router.refresh();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

    return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <span title="edit class">
            <Icons.edit
              className="ml-2 h-4 w-4 cursor-pointer"
              aria-label="edit class"
            />
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student Details</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Update the student detail below
            </DialogDescription>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Student name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => handleEditStudent(studentIdSelected)}
                >
                    Update Student
                </Button>
                <Button onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
    )
}