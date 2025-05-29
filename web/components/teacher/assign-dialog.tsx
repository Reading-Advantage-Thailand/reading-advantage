"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Article } from "@/components/models/article-model";
import { toast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useCourseStore } from "@/store/classroom-store";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
  article: Article;
  articleId: string;
  userId: string;
};

export default function AssignDialog({ article, articleId, userId }: Props) {
  const { courses } = useCourseStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxPoints: undefined,
    state: "DRAFT",
  });

  // Handle form input changes
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Assigngingment</Button>
        </DialogTrigger>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Class</Label>
              <Select
                onValueChange={(value) => handleChange("courseId", value)}
              >
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select a Class" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id!}>
                      {course.classroomName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Assignment Title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="mb-4"
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between"
                  >
                    {date ? format(date, "PPP") : "Select Due Date"}
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      handleChange(
                        "dueDate",
                        date?.toISOString().split("T")[0]
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button className="w-full">Create Assignment</Button>
            <Button
              variant="outline"
              onClick={() =>
                setForm({
                  courseId: "",
                  title: "",
                  description: "",
                  dueDate: "",
                  maxPoints: undefined,
                  state: "DRAFT",
                })
              }
              className="w-full"
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
