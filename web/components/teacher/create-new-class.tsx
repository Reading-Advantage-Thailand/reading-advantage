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
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    } finally {
      toast({
        title: t("toast.successCreate"),
        description: t("toast.successDescription"),
      });
      router.refresh();
      setOpen(false);
    }
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
            <Input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder={t("className")}
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
            />
            <Input
              type="text"
              value={classCode}
              readOnly
              className="flex-grow cursor-pointer"
            />
            <Select onValueChange={(value) => setGrade(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectGrade")} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 3).map(
                  (grade, index) => (
                    <SelectItem key={index} value={String(grade)}>
                      {t("grade")} {grade}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
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
