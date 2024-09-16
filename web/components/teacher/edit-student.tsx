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
  import React, { useState } from "react";
import { Icons } from "@/components/icons";
import axios from "axios";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";

type Student = {
    studentId: string;
    lastActivity: Date;
    studentName: string;
    classroomName: string;
    classroomId: string;
    email: string;
    xp: number;
  };
  
  type MyStudentProps = {
    userId: string;
    studentInClass: Student[];
    studentIdSelected: string;
  };

export default function EditStudent ({studentInClass, userId, studentIdSelected}: MyStudentProps) {
    const [open, setOpen] = useState(false); 
    const router = useRouter();  
    const studentToEdit = studentInClass.find((student) => student.studentId === studentIdSelected);
  const [studentName, setStudentName] = useState(studentToEdit? studentToEdit.studentName : "");
  const t = useScopedI18n('components.reports.editStudent');

  const handleEditStudent = async (studentId: string) => {
    setOpen(true);
    try {
      const editStudent = {
        name: studentName,
        studentId: studentId,
      };
      if (!userId || !studentName ) {
        toast({
          title: t('toast.attentionUpdate'),
          description: t('toast.attentionUpdateDescription'),
          variant: "destructive",
        })
        return;  
      } else {
        await axios.patch(`/api/classroom/students/${studentId}`, editStudent);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t('toast.errorUpdate'),
        description: t('toast.errorUpdateDescription'),
        variant: "destructive",
      });
    }
    toast({
      title: t('toast.successUpdate'),
      description: t('toast.successUpdateDescription'),
      variant: "default",
    });
    router.refresh();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

    return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <span title="edit class">
            <Icons.edit
              className="ml-2 h-4 w-4 cursor-pointer"
              aria-label="edit class"
            />
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('title')}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {t('description')}
            </DialogDescription>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder={t('placeholder')}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => handleEditStudent(studentIdSelected)}
                >
                    {t('update')}
                </Button>
                <Button onClick={handleClose}>{t('cancel')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
    )
}