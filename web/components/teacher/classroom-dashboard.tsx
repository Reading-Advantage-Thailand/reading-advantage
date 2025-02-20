"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { useScopedI18n } from "@/locales/client";
import { classroom_v1 } from "googleapis";

type Schema$Course = classroom_v1.Schema$Course;

interface CoursesResponse {
  courses: Schema$Course[];
  authUrl: string;
  accessToken: boolean;
  page?: string;
}

export default function ClassroomDashboard({
  courses,
  authUrl,
  accessToken,
  page,
}: CoursesResponse) {
  const [open, setOpen] = useState<boolean>(false);
  const [className, setClassName] = useState<string>("");
  const [RoomName, setRoomName] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("");
  const [sectionName, setSectionName] = useState<string>("");
  const router = useRouter();
  const t = useScopedI18n("components.myClasses.Classroom");
  const state = useScopedI18n("components.myClasses.Classroom.courseState");

  const stateColors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    PROVISIONED: "bg-yellow-500",
  };

  console.log(courses);

  const createCourses = async () => {
    const response = await fetch("/api/v1/classroom/oauth2/classroom/create", {
      method: "POST",
      body: JSON.stringify({
        name: className,
        room: RoomName,
        section: sectionName,
        description: subjectName,
      }),
    });

    if (response.status === 500) {
      setOpen(false);
      toast({
        title: t("toast.failedCreate"),
        description: t("toast.failedDescription"),
        variant: "destructive",
      });
    }

    if (response.status === 200) {
      setOpen(false);
      toast({
        title: t("toast.successCreate"),
        description: t("toast.successDescription"),
      });
      router.refresh();
    }
  };
  return (
    <>
      <div className="flex justify-between items-center">
        {accessToken && page !== "student" ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Icons.PlusCircle width={13} height={13} className="mr-1" />
                {t("createClassroom")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("title")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("className")}</Label>
                  <Input
                    type="text"
                    className="col-span-3"
                    onChange={(e) => setClassName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>{t("section")}</Label>
                  <Input
                    type="text"
                    className="col-span-3 cursor-default "
                    onChange={(e) => setSectionName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{t("subject")}</Label>
                  <Input
                    type="text"
                    className="col-span-3 cursor-default "
                    onChange={(e) => setSubjectName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{t("room")}</Label>
                  <Input
                    type="text"
                    className="col-span-3 cursor-default "
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("CancelButton")}
                </Button>
                <Button onClick={createCourses}>{t("CreateButton")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
        {!accessToken ? (
          <Link href={authUrl}>
            <Button>{t("login")}</Button>
          </Link>
        ) : (
          <Link href={authUrl}>
            <Button>{t("sync")}</Button>
          </Link>
        )}
      </div>
      {courses.length > 0 && courses !== undefined ? (
        <Card>
          <div className="grid sm:grid-cols-2 grid-flow-row mt-4">
            {[...courses]
              .sort(
                (a, b) =>
                  new Date(a.creationTime as string).getTime() -
                  new Date(b.creationTime as string).getTime()
              )
              .map((item: Schema$Course, index: number) =>
                ["ARCHIVED", "DECLINED"].includes(
                  item.courseState as string
                ) ? null : (
                  <CardContent key={index}>
                    <Card className="w-full shadow-lg border rounded-xl">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <Badge
                            className={`${
                              stateColors[item.courseState as string]
                            } text-white px-3 py-1`}
                          >
                            {state(
                              item.courseState as "ACTIVE" | "PROVISIONED"
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                          <Link
                            href={item.alternateLink as string}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icons.ExternalLink className="mr-2 h-4 w-4" />
                            {t("link")}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </CardContent>
                )
              )}
          </div>
        </Card>
      ) : null}
    </>
  );
}
