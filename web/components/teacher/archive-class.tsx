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
import { set } from "lodash";

interface ArchiveClassProps { 
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

function ArchiveClass({ classroomData }: ArchiveClassProps) {
  const [open, setOpen] = useState(false);
  const [archiveClass, setArchiveClass] = useState(false);

  const handleArchiveClass = async (classroomData: resClassroom) => {
    setOpen(true);
    try {
      const response = await axios.patch(`/api/classroom/${ classroomData.id }/archived`,
        { archived: true }
        );

      if (response.status === 200) {
        setArchiveClass(true);
        toast({
          title: "Class archived", 
          description: "Class has been archived successfully!",
          variant: "default",
        });
        location.reload();
      } else {
        throw new Error('Failed to archive class');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error", 
        description: "An error occurred while archiving the class",
        variant: "default",
    })
    }
    location.reload();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
          <Icons.archive
                    className="h-4 w-4"
                  />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive Class</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Do you want to archive <span className="font-bold">{classroomData.classroomName}</span> class?
            </DialogDescription>
            <DialogFooter>
              <Button variant="secondary" onClick={() => handleArchiveClass(classroomData)}>
                Archive
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ArchiveClass;
