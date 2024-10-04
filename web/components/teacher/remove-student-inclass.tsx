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
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";

interface RemoveStudentProps {
  studentInClass: Classes[];
  classroomIdSelected: string;
  studentIdSelected: string;
  userId: string;
}

type Classes = {
  studentId: string;
  lastActivity: Date;
  studentName: string;
  classroomName: string;
  classroomId: string;
  email: string;
  xp: number;
};

function RemoveStudent({
  studentInClass,
  classroomIdSelected,
  studentIdSelected,
}: RemoveStudentProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const studentName = studentInClass.find(
    (student) => student.studentId === studentIdSelected
  );
  const t = useScopedI18n("components.reports.removeStudent");

  const handleRemoveStudentInClass = async (
    classroomIdSelected: string,
    studentIdSelected: string,
    studentInClass: any
  ) => {
    const removedStudentInClass: any[] = [];
    studentInClass.forEach((student: any) => {
      if (student.studentId !== studentIdSelected) {
        removedStudentInClass.push(student.studentId);
      }
    });

    const updateStudentListBuilder = removedStudentInClass.map((student) => ({
      studentId: student,
      lastActivity: new Date(),
    }));

    setOpen(true);
    try {
      await fetch(`/api/v1/classroom/${classroomIdSelected}/unenroll`, {
        method: "PATCH",
        body: JSON.stringify({
          student: updateStudentListBuilder,
          studentId: studentIdSelected,
        }),
      });
      toast({
        title: t("toast.successRemove"),
        description: t("toast.successRemoveDescription"),
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t("toast.errorRemove"),
        description: t("toast.errorRemoveDescription"),
        variant: "destructive",
      });
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
            <span title="remove student">
              <Icons.delete
                className="h-4 w-4 cursor-pointer"
                aria-label="remove student in class"
              />
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {t("descriptionBefore")}{" "}
              <span className="font-bold">{studentName?.studentName}</span>{" "}
              {t("descriptionAfter")}
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() =>
                  handleRemoveStudentInClass(
                    classroomIdSelected,
                    studentIdSelected,
                    studentInClass
                  )
                }
              >
                {t("remove")}
              </Button>
              <Button onClick={handleClose}>{t("cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default RemoveStudent;
