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
  userData: Student;
  classroomData: Classrooms[];
}

type StudentInClass = {
  studentId: string;
  lastActivity: string;
};

type Classrooms = {
  id: string;
  classroomName: string;
  student: StudentInClass[];
};

type Student = {
  id: string;
  display_name: string;
  email: string;
  last_activity: string;
  level: number;
  xp: number;
};

function RemoveStudent({ userData, classroomData }: RemoveStudentProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useScopedI18n("components.reports.removeStudent");

  const handleRemoveStudentInClass = async (
    studentId: string,
    studentInClass: Classrooms[]
  ) => {
    const studentDelete = studentInClass[0]?.student.filter(
      (student: StudentInClass) => student.studentId !== studentId
    );
    try {
      const response = await fetch(
        `/api/v1/classroom/${studentInClass[0].id}/unenroll`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student: studentDelete,
          }),
        }
      );
      if (!response.ok) {
        toast({
          title: t("toast.errorRemove"),
          description: t("toast.errorRemoveDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("toast.errorRemove"),
        description: t("toast.errorRemoveDescription"),
        variant: "destructive",
      });
    } finally {
      toast({
        title: t("toast.successRemove"),
        description: t("toast.successRemoveDescription"),
        variant: "default",
      });
      router.refresh();
      setOpen(false);
    }
  };

  return (
    <div>
      <div>
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
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
              {t("descriptionBefore")}
              <span className="font-bold">{userData.display_name}</span>
              {t("descriptionAfter")}
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() =>
                  handleRemoveStudentInClass(userData.id, classroomData)
                }
              >
                {t("remove")}
              </Button>
              <Button onClick={() => setOpen(false)}>{t("cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default RemoveStudent;
