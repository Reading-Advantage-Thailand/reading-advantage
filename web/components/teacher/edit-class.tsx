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
  const classroomToEdit = classroomData.find(
    (classroom) => classroom.id === classroomId
  );
  const [classroomName, setClassroomName] = useState(
    classroomToEdit ? classroomToEdit.classroomName : ""
  );
  const [grade, setGrade] = useState(
    classroomToEdit ? classroomToEdit.grade : ""
  );
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useScopedI18n("components.myClasses.edit");

  const handleEditClass = async (classroomId: string) => {
    setOpen(true);
    try {
      const editClassroom = {
        classroomName: classroomName,
        grade: grade,
      };
      if (!userId || !classroomName || !grade) {
        toast({
          title: t("toast.attention"),
          description: t("toast.attentionDescription"),
          variant: "destructive",
        });
        return;
      } else {
        await fetch(`/api/v1/classroom/${classroomId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editClassroom),
        });
      }
    } catch (error) {
      console.error(error);
    }
    toast({
      title: t("toast.successUpdate"),
      description: t("toast.successUpdateDescription"),
      variant: "default",
    });
    router.refresh();
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
                <DialogTitle>{t("title")}</DialogTitle>
              </DialogHeader>
              <DialogDescription>{t("description")}</DialogDescription>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder={t("className")}
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
                <option value="select">{t("selectGrade")}</option>
                {Array.from({ length: 10 }, (_, i) => i + 3).map((grade) => (
                  <option key={grade} value={grade}>
                    {t("grade")} {grade}
                  </option>
                ))}
              </select>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleEditClass(classroomId)}
                >
                  {t("update")}
                </Button>
                <Button onClick={handleClose}>{t("cancel")}</Button>
              </DialogFooter>
            </DialogContent>
          </div>
        ))}
      </Dialog>
    </div>
  );
}

export default EditClass;
