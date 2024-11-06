"use client";
import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useScopedI18n } from "@/locales/client";

type Student = {
  studentId: string;
  lastActivity: {
    _seconds: number;
    _nanoseconds: number;
  };
  studentName: string;
  classroomName: string;
  classroomsId: string;
  email: string;
};

type Classrooms = {
  id: string;
  classroomName: string;
};

type CreateNewStudentProps = {
  studentDataInClass: Student[];
  allStudentEmail: any;
  studentInEachClass: any;
  classrooms: Classrooms[];
  userArticleRecords: string[][];
};

export default function CreateNewStudent({
  studentDataInClass,
  allStudentEmail,
  studentInEachClass,
  classrooms,
  userArticleRecords = [],
}: CreateNewStudentProps) {
  const router = useRouter();
  const [inputs, setInputs] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useScopedI18n("components.classRoster.addNewStudent");

  let classroomId: string = "";
  if (
    studentDataInClass &&
    studentDataInClass.length > 0 &&
    "classroomsId" in studentDataInClass[0]
  ) {
    classroomId = studentDataInClass[0].classroomsId;
  } else if (classrooms && classrooms.length > 0 && "id" in classrooms[0]) {
    classroomId = classrooms[0].id;
  } else {
    console.log("Unable to determine classroomId");
  }

  const className =
    studentDataInClass && studentDataInClass.length > 0
      ? studentDataInClass[0].classroomName
      : classrooms[0].classroomName;

  const convertDateToISOString = (dateString: string): string => {
    if (dateString === "No Activity") {
      return dateString;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateString)) {
      const [year, month, day] = dateString.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return date.toISOString();
    }
    return dateString;
  };

  console.log(studentDataInClass);

  const handleAddStudent = async (classroomId: string, email: string) => {
    const isEmailAlreadyInClass = studentDataInClass.some(
      (student) => student.email === email
    );

    if (isEmailAlreadyInClass) {
      toast({
        title: t("toast.studentAlreadyInClass"),
        description: t("toast.studentAlreadyInClassDescription"),
        variant: "destructive",
      });
      return;
    }

    const isEmailInAllStudents = allStudentEmail.some(
      (student: { email: string; studentId: string }) => student.email === email
    );

    if (!isEmailInAllStudents) {
      toast({
        title: t("toast.emailNotFound"),
        description: t("toast.emailNotFoundDescription"),
        variant: "destructive",
      });
      return;
    }

    const studentToAdd = allStudentEmail.find(
      (student: { email: string; studentId: string }) => student.email === email
    );

    if (studentToAdd && !studentInEachClass.includes(studentToAdd.studentId)) {
      const updatedStudentList = [
        ...studentInEachClass,
        studentToAdd.studentId,
      ];

      const updateStudentListBuilder = updatedStudentList.map(
        (studentId: string) => {
          const userLastActivity = userArticleRecords.find(
            (record: string[]) => record[0] === studentId
          );

          let lastActivityTimestamp;

          if (userLastActivity && userLastActivity[1]) {
            lastActivityTimestamp = convertDateToISOString(userLastActivity[1]);
          } else {
            lastActivityTimestamp = "No Activity";
          }

          return {
            studentId,
            lastActivity: lastActivityTimestamp,
          };
        }
      );

      // const updateStudentListBuilder = updatedStudentList.map(
      //   (studentId: string) => {
      //     console.log("-----------------------------------------------");
      //     console.log("userArticleRecords", userArticleRecords);
      //     console.log("studentId", studentId);
      //     return new Promise((resolve, reject) => {
      //       const userLastActivity = userArticleRecords.find(
      //         (record: string[]) => {
      //           console.log("record[0]", record[0]);
      //           return record[0] === studentId;
      //         }
      //       );
      //       console.log("userLastActivity 1xxx", userLastActivity);
      //       if (userLastActivity) {
      //         console.log("ok");
      //         resolve(userLastActivity);
      //       } else {
      //         reject("No Activity");
      //       }
      //     })
      //       .then((userLastActivity) => {
      //         console.log("userLastActivity 1", userLastActivity as string[]);
      //         if ((userLastActivity as string[])[1]) {
      //           return convertDateToISOString(
      //             (userLastActivity as string[])[1]
      //           );
      //         } else {
      //           // throw new Error("No Activity");
      //           console.log(userLastActivity);
      //         }
      //       })
      //       .then((userLastActivity) => {
      //         console.log("userLastActivity 2", userLastActivity);
      //         return {
      //           studentId,
      //           lastActivity: userLastActivity,
      //         };
      //       })
      //       .catch((error) => {
      //         console.log("error:", error);
      //       })
      //       .finally(() => {
      //         return {
      //           studentId,
      //           lastActivity: "No Activity",
      //         };
      //       });
      //   }
      // );

      try {
        const response = await fetch(
          `/api/v1/classroom/${classroomId}/enroll`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student: updateStudentListBuilder,
            }),
          }
        );
        if (response.status === 200) {
          toast({
            title: t("toast.successAddStudent"),
            description: t("toast.successAddStudentDescription"),
            variant: "default",
          });
          router.push(`/teacher/class-roster/${classroomId}`);
        } else {
          console.log("add failed with status: ", response.status);
          toast({
            title: t("toast.errorAddStudent"),
            description: t("toast.errorAddStudentDescription"),
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error adding student:", error);
        toast({
          title: t("toast.errorAddStudent"),
          description: t("toast.errorAddStudentDescription"),
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: t("toast.studentAlreadyInClass"),
        description: t("toast.studentAlreadyInClassDescription"),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formRef.current) {
      const formEmail = new FormData(formRef.current);
      const entriesArray = Array.from(formEmail.entries());
      const data = Object.fromEntries(entriesArray);
      console.log(classroomId, data.email);
      handleAddStudent(classroomId, data.email as string);
    }
  };

  return (
    <div>
      <Card className="flex flex-col items-center justify-center">
        <CardTitle className="mt-10 mb-4 text-3xl ">
          {t("title", { className: className })}
        </CardTitle>
        <CardDescription className="text-base mb-4">
          {t("description")}
        </CardDescription>
        <form ref={formRef} onSubmit={handleSubmit}>
          <CardContent className="flex flex-col items-center mb-8 overflow-auto md:w-full">
            <Card className="my-4 overflow-x-auto flex flex-col items-center justify-center">
              <div className="flex justify-center items-center mt-8 w-[90%]">
                <label htmlFor="email" className="text-base">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder={t("placeholder")}
                  className="hover:border-none border-b p-2 m-2 focus:outline-none focus:border-transparent overflow-x-auto"
                />
              </div>
              {Array.from({ length: inputs }).map((_: any, index: number) => (
                <Input
                  key={index}
                  type="email"
                  name="email"
                  placeholder={t("placeholder")}
                  className="hover:border-none border-b p-2 m-2 ml-12 focus:outline-none focus:border-transparent overflow-x-auto w-[77%]"
                />
              ))}
              <Link
                href=""
                className="flex justify-end m-4 p-4 text-[#3882fd] cursor-pointer"
                onClick={() => {
                  setInputs((prevInputs) => prevInputs + 1);
                }}
              >
                {t("addStudent")} <Icons.addUser className="w-5 ml-2" />
              </Link>
              <CardDescription className="text-center w-full m-4 p-4 mr-8 text-red-500 mb-16">
                {t("warning")}
              </CardDescription>
            </Card>
            <Button type="submit" variant={"default"} className=" mt-2">
              {t("saveButton")}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
