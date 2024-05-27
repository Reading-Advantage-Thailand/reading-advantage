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
import { useScopedI18n } from "@/locales/client";

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
  const t = useScopedI18n("components.myClasses.delete");

  const handleDeleteClass = async (classroomId: string) => {
    setOpen(true);
    try {
        await axios.delete(`/api/classroom/${classroomId}`);
        toast({
          title: t("toast.successDelete"), 
          description: t("toast.successDeleteDescription"),
          variant: "default",
      })
    } catch (error) {
        console.error(error);
        toast({
            title: t("toast.errorDelete"), 
            description: t("toast.errorDeleteDescription"),
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
              <DialogTitle>{t('title')}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {t('descriptionBefore')} <span className="font-bold">{classroom?. classroomName}</span> {t('descriptionAfter')}
            </DialogDescription>
            <DialogFooter>
              <Button variant="destructive" onClick={() => handleDeleteClass(classroomId)}>
                {t('delete')}
              </Button>
              <Button onClick={handleClose}>{t('cancel')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default DeleteClass;
