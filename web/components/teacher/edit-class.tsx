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

type resClassroom = {
  classroomName: string;
  classCode: string;
  noOfStudents: number;
  grade: string;
  coTeacher: {
    [x: string]: any;
    coTeacherId: string;
    name: string;
  };
  id: string;
};

interface EditClassProps {
  userId: string;
  classroomData: resClassroom;
  title: string;
}

interface CoTeacher {
  coteacherId: string;
  name: string;
}

function EditClass({ userId, classroomData }: EditClassProps) {
  const [classroomName, setClassroomName] = useState(
    classroomData.classroomName
  );
  const [grade, setGrade] = useState(classroomData.grade);
  const [coTeachers, setCoTeachers] = useState<CoTeacher[]>(
    Array.isArray(classroomData.coTeacher)
      ? classroomData.coTeacher.map((coTeacher) => ({
          ...coTeacher,
          name: coTeacher.name || "",
        }))
      : [
          {
            ...classroomData.coTeacher,
            name: classroomData.coTeacher.name || "",
          },
        ]
  );
  const [classCode, setClassCode] = useState(classroomData.classCode);
  const [noOfStudents, setNoOfStudents] = useState(classroomData.noOfStudents);
  const [open, setOpen] = useState(false);

  const handleEditClass = async (classroomData: resClassroom) => {
    setOpen(true);
    try {
      const classroom = {
        teacherId: userId,
        classCode: classCode,
        classroomName: classroomName,
        coTeacher: coTeachers,
        description: "description",
        grade: grade,
        noOfStudents: noOfStudents,
        student: [{ studentId: userId, lastActivity: new Date() }],
        title: "title",
      };
      await axios.patch(`/api/classroom/${classroomData.id}`, classroom);
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

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  return (
    <div>
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
              key={classroomData.id}
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
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="0">Select Grade</option>
              <option value="1">grade 1</option>
              <option value="2">grade 2</option>
              <option value="3">grade 3</option>
            </select>
            {coTeachers.map((coTeacher, index) => (
              <input
                key={index}
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="Co-teacher name"
                value={coTeacher.name}
                onChange={(e) => {
                  const newCoTeachers: CoTeacher[] = [...coTeachers];
                  newCoTeachers[index] = {
                    ...newCoTeachers[index],
                    name: e.target.value,
                  };
                  setCoTeachers(newCoTeachers);
                }}
              />
            ))}
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="No of Students"
              value={noOfStudents}
              onChange={(e) => setNoOfStudents(Number(e.target.value))}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleEditClass(classroomData)}
              >
                Update Class
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default EditClass;
