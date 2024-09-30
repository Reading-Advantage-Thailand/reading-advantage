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
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";

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
  const classroom = classroomData.find(
    (classroom) => classroom.id === classroomId
  );
  const t = useScopedI18n("components.myClasses.archieve");

  const handleArchiveClass = async (classroomId: string) => {
    setOpen(true);
    try {
      const res = await fetch(`/api/v1/classroom/${classroomId}/achived`, {
        method: "PATCH",
        body: JSON.stringify({ archived: true }),
      });

      if (res.status === 200) {
        setArchiveClass(true);
        toast({
          title: t("toast.successArchive"),
          description: t("toast.successArchiveDescription"),
          variant: "default",
        });
        router.refresh();
      } else {
        throw new Error("Failed to archive class");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t("toast.errorArchive"),
        description: t("toast.errorArchiveDescription"),
        variant: "destructive",
      });
    }
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
              <DialogTitle>{t("title")}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {t("descriptionBefore")}
              <span className="font-bold">{classroom?.classroomName}</span>
              {t("descriptionAfter")}
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => handleArchiveClass(classroomId)}
              >
                {t("archive")}
              </Button>
              <Button onClick={handleClose}>{t("cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ArchiveClass;
