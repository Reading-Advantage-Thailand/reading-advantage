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
import { toast } from '../ui/use-toast';

interface DeleteClassProps { 
  userId: string;
  open: boolean;
  onClose: () => void;
  classroomData: resClassroom;
}

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

interface CoTeacher {
  coteacherId: string;
  name: string;
}

function DeleteClass ({ userId, open: isOpen, onClose, classroomData }: DeleteClassProps) {
  const [open, setOpen] = useState(false);

  const handleDeleteClass = async (classroomData: resClassroom) => {
    setOpen(true);
    // setLoading(true);
    try {
        await axios.delete(`/api/classroom/${classroomData.id}`);
        toast({
          title: "Class deleted", 
          description: "Class has been deleted successfully",
          variant: "default",
      })
    } catch (error) {
        console.error(error);
        toast({
            title: "Error", 
            description: "Error deleting class",
            variant: "destructive",
        })
    } finally {
        location.reload();
        setOpen(false);
        }
  };

  const handleClose = () => {
    setOpen(false);
  };


  return (
    <div>
      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
          <Icons.delete
                    className="h-4 w-4 cursor-pointer"
                  />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Class</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Do you want to delete <span className="font-bold">{classroomData.classroomName}</span> class ?
            </DialogDescription>
            <DialogFooter>
              <Button variant="destructive" onClick={() => handleDeleteClass(classroomData)}>
                Delete
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default DeleteClass;
