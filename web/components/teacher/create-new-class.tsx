import React, { useEffect, useState } from "react";
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

function CreateNewClass({ userId, userName }: { userId: string, userName: string}) {
  const [classroomName, setClassroomName] = useState("");
  const [grade, setGrade] = useState("");
  const [classCode, setClassCode] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreateClass = async () => {
    setOpen(true);
    try {
      const classroom = {
        teacherId: userId,
        classCode: classCode,
        classroomName: classroomName,
        description: "description",
        grade: grade,
        // student: [{ studentId: "", lastActivity: new Date() }],
        student: [],
        title: `${userName}'s Classes`,
      };

      if (!userId || !classCode || !classroomName || !grade ) {
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

  useEffect(() => { 
    setClassCode(generateRandomCode());
  }, []);

  return (
    <div>
      <div className="max-w-sm mt-4">
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
              <input type="text" value={classCode} readOnly className="flex-grow cursor-pointer"/>
            </div>
            <select
              className="w-full border rounded-md p-2"
              name="grade"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="select">Select Grade</option>
              <option value="3">grade 3</option>
              <option value="4">grade 4</option>
              <option value="5">grade 5</option>
              <option value="6">grade 6</option>
              <option value="7">grade 7</option>
              <option value="8">grade 8</option>
              <option value="9">grade 9</option>
              <option value="10">grade 10</option>
              <option value="11">grade 11</option>
              <option value="12">grade 12</option>
            </select>
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
