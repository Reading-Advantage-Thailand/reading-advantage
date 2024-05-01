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

function CreateNewStudent() {
    const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="max-w-sm mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Icons.add />
              &nbsp; Add new students
            </Button>
          </DialogTrigger>
            <DialogContent>Create new student dialog coming soon</DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CreateNewStudent;
