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
import { toast } from '../ui/use-toast';
import { useRouter } from "next/navigation";

interface DeleteClassProps { 
  classroomData: Classes[];
  title: string;
  classroomId: string;
}

type Classes = {
  classroomName: string;
  grade: string;
  id: string;
};

function DeleteClass ({ classroomData, classroomId, title}: DeleteClassProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const classroom = classroomData.find((classroom) => classroom.id === classroomId);

  const handleDeleteClass = async (classroomId: string) => {
    setOpen(true);
    try {
        await axios.delete(`/api/classroom/${classroomId}`);
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
      router.refresh();
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
            <span title="delete class">
          <Icons.delete
                    className="h-4 w-4 cursor-pointer"
                    aria-label="delete class"
                  />
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Classroom</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Do you want to delete <span className="font-bold">{classroom?. classroomName}</span> classroom ?
            </DialogDescription>
            <DialogFooter>
              <Button variant="destructive" onClick={() => handleDeleteClass(classroomId)}>
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
