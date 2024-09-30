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
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";

function CreateNewClass({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [classroomName, setClassroomName] = useState("");
  const [grade, setGrade] = useState("");
  const [classCode, setClassCode] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useScopedI18n("components.myClasses.createNewClass");

  const handleCreateClass = async () => {
    setOpen(true);
    try {
      const classroom = {
        teacherId: userId,
        classCode: classCode,
        classroomName: classroomName,
        description: "description",
        grade: grade,
        student: [],
        title: `${userName}'s Classes`,
      };

      if (!userId || !classCode || !classroomName || !grade) {
        toast({
          title: t("toast.attention"),
          description: t("toast.attentionDescription"),
          variant: "destructive",
        });
        return;
      } else {
        await fetch(`/api/v1/classroom/`, {
          method: "POST",
          body: JSON.stringify({ classroom }),
        });
      }
    } catch (error) {
      console.error(error);
    }
    toast({
      title: t("toast.successCreate"),
      description: t("toast.successDescription"),
    });
    router.refresh();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  useEffect(() => {
    setClassCode(generateRandomCode());
  }, []);

  return (
    <div>
      <div className="max-w-sm mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Icons.add />
              &nbsp; {t("button")}
            </Button>
          </DialogTrigger>
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
              onChange={(e) => setClassroomName(e.target.value)}
            />
            <div className="flex w-full border rounded-md p-2">
              <input
                type="text"
                value={classCode}
                readOnly
                className="flex-grow cursor-pointer"
              />
            </div>
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
              <Button variant="outline" onClick={() => handleCreateClass()}>
                {t("create")}
              </Button>
              <Button onClick={handleClose}>{t("cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CreateNewClass;
