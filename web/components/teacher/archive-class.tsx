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
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";
import { useClassroomStore } from "@/store/classroom-store";

// กำหนดโครงสร้างข้อมูลสำหรับห้องเรียนที่ส่งเข้ามาใช้งานในคอมโพเนนต์
type Classes = {
  classroomName: string;
  grade: string;
  id: string;
  archived: boolean;
};

interface ArchiveClassProps {
  classroomData: Classes;
}

function ArchiveClass({ classroomData }: ArchiveClassProps) {
  // กำหนดสถานะการเปิดปิดของหน้าต่างและการประมวลผลคำสั่งส่งข้อมูล
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const t = useScopedI18n("components.myClasses.archieve");
  const { fetchClassrooms } = useClassroomStore();

  // ตรวจสอบสถานะว่าห้องเรียนดังกล่าวถูกเก็บถาวรแล้วหรือไม่
  const isArchived = !!classroomData.archived;

  // ฟังก์ชันหลักในการจัดเก็บหรือกู้คืนสถานะของห้องเรียน
  const handleArchiveClass = async (classroomId: string) => {
    setIsPending(true);
    try {
      // เรียกใช้ API เส้นใหม่ที่แก้ไขตัวสะกดคำว่า archived ถูกต้อง
      const res = await fetch(`/api/v1/classroom/${classroomId}/archived`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !isArchived }),
      });

      if (res.status === 200) {
        // แสดงกล่องแจ้งเตือนความสำเร็จโดยอ้างอิงข้อความแปลตามสถานะปัจจุบัน
        toast({
          title: isArchived 
            ? t("toast.successRestore") || "Restore Successful" 
            : t("toast.successArchive") || "Archive Successful",
          description: isArchived 
            ? t("toast.successRestoreDescription") || `Successfully restored ${classroomData.classroomName}`
            : t("toast.successArchiveDescription") || `Successfully archived ${classroomData.classroomName}`,
          variant: "default",
        });
        
        // ดึงข้อมูลห้องเรียนล่าสุดในระบบมาอัปเดตตารางแสดงผลทันทีโดยไม่ต้องรีเฟรชหน้าเว็บ
        await fetchClassrooms();
        router.refresh();
        setOpen(false);
      } else {
        throw new Error(isArchived ? "Failed to restore class" : "Failed to archive class");
      }
    } catch (error) {
      console.error(error);
      // แสดงกล่องข้อความเตือนความล้มเหลวหากเกิดข้อผิดพลาดในการส่งข้อมูล
      toast({
        title: isArchived 
          ? t("toast.errorRestore") || "Restore Failed" 
          : t("toast.errorArchive") || "Archive Failed",
        description: isArchived 
          ? t("toast.errorRestoreDescription") || "Could not complete restore action. Please try again."
          : t("toast.errorArchiveDescription") || "Could not complete archive action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // กำหนดตัวแปรสำหรับแสดงผลข้อความคำอธิบายในหน้าต่างตามสถานะการทำงานปัจจุบัน
  const titleText = isArchived 
    ? t("restoreTitle") || "Restore Class" 
    : t("title") || "Archive Class";

  const descriptionBefore = isArchived 
    ? t("restoreDescriptionBefore") || "Are you sure you want to restore " 
    : t("descriptionBefore") || "Are you sure you want to archive ";

  const descriptionAfter = isArchived 
    ? t("restoreDescriptionAfter") || "?" 
    : t("descriptionAfter") || "?";

  const actionButtonText = isArchived 
    ? t("restore") || "Restore" 
    : t("archive") || "Archive";

  const cancelButtonText = t("cancel") || "Cancel";

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* สลับการแสดงผลหน้าตารูปแบบปุ่มและไอคอนตามสถานะการจัดเก็บข้อมูลปัจจุบัน */}
          {isArchived ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 dark:hover:bg-emerald-950/20"
            >
              Restore
            </Button>
          ) : (
            <Icons.archive
              className="h-4 w-4 cursor-pointer text-slate-500 hover:text-rose-600"
              aria-label="archive class"
            />
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{titleText}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {descriptionBefore}
            <span className="font-bold">{classroomData.classroomName}</span>
            {descriptionAfter}
          </DialogDescription>
          <DialogFooter>
            {/* แสดงปุ่มยืนยันทำรายการพร้อมทั้งล็อกสถานะการส่งข้อมูลซ้ำในระหว่างโหลดข้อมูล */}
            <Button
              variant={isArchived ? "default" : "secondary"}
              onClick={() => handleArchiveClass(classroomData.id)}
              disabled={isPending}
              className={isArchived ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              {actionButtonText}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              {cancelButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ArchiveClass;
