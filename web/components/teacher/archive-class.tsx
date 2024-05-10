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

interface ArchiveClassProps { 
  classroomData: Classes[];
  title: string;
  classroomId: string;
}

type Classes = {
  classroomName: string;
  grade: string;
  id: string;
};

function ArchiveClass({ classroomData, classroomId }: ArchiveClassProps) {
  const [open, setOpen] = useState(false);
  const [archiveClass, setArchiveClass] = useState(false);
  const router = useRouter();
  const classroom = classroomData.find((classroom) => classroom.id === classroomId);

  const handleArchiveClass = async (classroomId: string) => {
    setOpen(true);
    try {
      const response = await axios.patch(`/api/classroom/${ classroomId }/archived`,
        { archived: true }
        );

      if (response.status === 200) {
        setArchiveClass(true);
        toast({
          title: "Class archived", 
          description: "Class has been archived successfully!",
          variant: "default",
        });
        router.refresh();
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
    router.refresh();
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
            <span title="archive class">
          <Icons.archive
                    className="h-4 w-4 cursor-pointer"
                    aria-label="archive class"
                  />
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive Class</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Do you want to archive <span className="font-bold">{classroom?.classroomName}</span> class?
            </DialogDescription>
            <DialogFooter>
              <Button variant="secondary" onClick={() => handleArchiveClass(classroomId)}>
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
