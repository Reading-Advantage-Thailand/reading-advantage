"use client";

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
import { useToast } from "@/components/ui/use-toast";
import { useScopedI18n } from "@/locales/client";
import { useClassroomStore, Classes } from "@/store/classroom-store";
import { Loader2, Archive, RefreshCw } from "lucide-react";

interface ArchiveClassProps {
  classroomData: Classes;
}

export default function ArchiveClass({ classroomData }: ArchiveClassProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fetchClassrooms = useClassroomStore((state) => state.fetchClassrooms);
  
  const scope = "components.myClasses" as const;
  const t = useScopedI18n(scope);
  
  // Determine current archive state
  const isArchived = classroomData.archived;

  const handleArchiveClass = async () => {
    setLoading(true);
    try {
      const targetStatus = !isArchived;
      const apiBody = JSON.stringify({ archived: targetStatus });

      // Step 1: Attempt to use the new corrected API path
      let res = await fetch(
        `/api/v1/classroom/${classroomData.id}/archived`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: apiBody,
        }
      );

      // Step 2: Fallback to the legacy API path if the new one is not yet registered (404)
      if (res.status === 404) {
        console.warn("New API path not registered yet. Falling back to legacy API.");
        res = await fetch(
          `/api/v1/classroom/${classroomData.id}/achived`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: apiBody,
          }
        );
      }

      if (res.status === 200) {
        // Safe type assertion to avoid i18n key type mismatches during build
        const successTitle = isArchived 
          ? (t as any)("toast.successRestore") || "Restore Successful" 
          : (t as any)("toast.successArchive") || "Archive Successful";

        toast({
          title: successTitle,
          description: isArchived 
            ? `Successfully restored ${classroomData.classroomName}`
            : `Successfully archived ${classroomData.classroomName}`,
        });

        // Refetch updated status and close dialog
        await fetchClassrooms();
        setOpen(false);
      } else {
        const errorText = await res.text();
        throw new Error(errorText || "Server responded with an error status");
      }
    } catch (error) {
      console.error("Archive operation failed:", error);
      
      const errorTitle = isArchived 
        ? (t as any)("toast.errorRestore") || "Restore Failed" 
        : (t as any)("toast.errorArchive") || "Archive Failed";

      toast({
        title: errorTitle,
        description: "Please check your database connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Setup UI text from translation fallback properties
  const titleText = isArchived 
    ? (t as any)("restoreTitle") || "Restore Class" 
    : (t as any)("title") || "Archive Class";

  const descriptionBefore = isArchived 
    ? (t as any)("restoreDescriptionBefore") || "Are you sure you want to restore " 
    : (t as any)("descriptionBefore") || "Are you sure you want to archive ";

  const actionButtonText = isArchived 
    ? (t as any)("restore") || "Restore" 
    : (t as any)("archive") || "Archive";

  const cancelButtonText = (t as any)("cancel") || "Cancel";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isArchived ? (
          <Button variant="ghost" size="sm" className="h-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-semibold gap-1">
            <RefreshCw className="w-4 h-4" />
            Restore
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-9 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-semibold gap-1">
            <Archive className="w-4 h-4" />
            Archive
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isArchived ? (
              <RefreshCw className="w-5 h-5 text-emerald-600" />
            ) : (
              <Archive className="w-5 h-5 text-amber-600" />
            )}
            {titleText}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-slate-500 dark:text-slate-400">
            {descriptionBefore}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {classroomData.classroomName}
            </strong>
            ?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            {cancelButtonText}
          </Button>
          
          <Button
            variant={isArchived ? "default" : "destructive"}
            onClick={handleArchiveClass}
            disabled={loading}
            className={isArchived ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {actionButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
