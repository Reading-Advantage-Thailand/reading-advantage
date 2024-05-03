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

type Classes = {
  classroomName: string;
  classCode: string;
  grade: string;
  id: string;
};

interface EditClassProps {
  userId: string;
  classroomData: Classes[];
  title: string;
  classroomId: string;
}

function EditClass({ userId, classroomData, classroomId }: EditClassProps) {
  const classroomToEdit = classroomData.find((classroom) => classroom.id === classroomId);
  const [classroomName, setClassroomName] = useState(classroomToEdit? classroomToEdit.classroomName : "");
  const [grade, setGrade] = useState(classroomToEdit? classroomToEdit.grade : "");
  const [open, setOpen] = useState(false);

  const handleEditClass = async (classroomId: string) => {
    setOpen(true);
    try {
      const editClassroom = {
        classroomName: classroomName,
        grade: grade,
      };
      if (!userId || !classroomName || !grade ) {
        toast({
          title: "Attention",
          description: "All fields must be filled out!",
          variant: "destructive",
        })
        return;  
      } else {
        await axios.patch(`/api/classroom/${classroomId}`, editClassroom);
      }
    } catch (error) {
      console.error(error);
    }
    toast({
      title: "Update Successful",
      description: "Class updated successfully",
      variant: "default",
    });
    location.reload();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <span title="edit class">
            <Icons.edit
              className="ml-2 h-4 w-4 cursor-pointer"
              aria-label="edit class"
            />
            </span>
          </DialogTrigger>
          {classroomData.map((classroom) => (
        <div key={classroom.id}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class Details</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Update the class details below
            </DialogDescription>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Class name"
              value={classroomName}
              key={classroom.id}
              onChange={(e) => setClassroomName(e.target.value)}
            />
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
              <option value="13">grade 13</option>
            </select>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleEditClass(classroomId)}
              >
                Update Class
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
          
        </div>
      ))}
        </Dialog>
    </div>
  );
}

export default EditClass;
