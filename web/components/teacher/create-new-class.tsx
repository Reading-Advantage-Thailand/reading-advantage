import React, { useState } from "react";
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
import { Icons } from "@/components/icons";
import axios from "axios";
import { toast } from "../ui/use-toast";

function CreateNewClass({ userId }: { userId: string }) {
  const [classroomName, setClassroomName] = useState("");
  const [grade, setGrade] = useState("0");
  const [coTeachers, setCoTeachers] = useState({
    coteacherId: "userId",
    name: "",
  });
  const [classCode, setClassCode] = useState("");
  const [noOfStudents, setNoOfStudents] = useState(0);
  const [open, setOpen] = useState(false);

  const handleCreateClass = async () => {
    setOpen(true);
    try {
      const classroom = {
        teacherId: userId,
        classCode: classCode,
        classroomName: classroomName,
        coTeacher: [{ coteacherId: userId, name: coTeachers.name }],
        description: "description",
        grade: grade,
        noOfStudents: noOfStudents,
        student: [{ studentId: userId, lastActivity: new Date() }],
        title: "title",
        // createAT: new Date(),
      };

      if (!userId || !classCode || !classroomName || !grade || !noOfStudents) {
        toast({
          title: "Attention",
          description: "All fields must be filled out!",
          variant: "destructive",
        });
        return;
      } else {
        await axios.post(`/api/classroom/`, {
          classroom,
        });
      }
    } catch (error) {
      console.error(error);
    }
    toast({
      title: "Success",
      description: "Class created successfully",
    });
    location.reload();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  return (
    <div>
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
              <DialogTitle>Create a new class</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Fill in the details to create a new class
            </DialogDescription>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Class name"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
            />
            <div className="flex w-full border rounded-md p-2">
              <input
                type="text"
                className="flex-grow"
                placeholder="Class Code"
                value={classCode}
              />
              <div className="self-center cursor-pointer">
                <Icons.refresh
                  className="cursor-pointer"
                  onClick={() => setClassCode(generateRandomCode())}
                />
              </div>
            </div>
            <select
              className="w-full border rounded-md p-2"
              name="grade"
              id="grade"
              value={grade}
              placeholder="grade"
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="select">Select Grade</option>
              <option value="1">grade 1</option>
              <option value="2">grade 2</option>
              <option value="3">grade 3</option>
            </select>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Co-teachers"
              value={coTeachers.name}
              onChange={(e) =>
                setCoTeachers({ ...coTeachers, name: e.target.value })
              }
            />
            <input
              type="number"
              className="w-full border rounded-md p-2"
              placeholder="No of Students"
              value={noOfStudents}
              onChange={(e) => setNoOfStudents(Number(e.target.value))}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => handleCreateClass()}>
                Create Class
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CreateNewClass;
