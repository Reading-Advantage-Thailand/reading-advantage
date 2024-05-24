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
import axios from "axios";
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

type CreateNewStudentProps = {
  studentDataInClass: Student[];
  allStudentEmail: any;
  studentInEachClass: any;
};

export default function CreateNewStudent({
  studentDataInClass,
  allStudentEmail,
  studentInEachClass,
}: CreateNewStudentProps) {
  const router = useRouter();
  const [inputs, setInputs] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useScopedI18n("components.classRoster.addNewStudent");

  const classroomId = studentDataInClass[0].classroomsId;

  const handleAddStudent = async (classroomId: string, email: string) => {
    let studentEmail = allStudentEmail.map(
      (student: { email: string; studentId: string }) => student.email
    );
    const studentIdToAdd = () => {
      allStudentEmail.forEach(
        (student: { email: string; studentId: string }) => {
            studentInEachClass.forEach((studentId: string) => {
                if (student.email === email) {
                  if (studentId !== student.studentId && !studentInEachClass.includes(student.studentId)) {
                    studentInEachClass.push(student.studentId);
                  }
                }
            });
        }
      );
      return studentInEachClass;
    };
    const studentId = studentIdToAdd();

    const updateStudentListBuilder = studentId.map((id: string) => ({
      studentId: id,
      lastActivity: new Date(),
    }));

    if (studentEmail.includes(email) && email !== studentId) {
      try {
        const response = await axios.patch(
          `/api/classroom/${classroomId}/enroll`,
          {
            student: updateStudentListBuilder,
          }
        );

        if (response.status === 200) {
          toast({
            title: t('toast.successAddStudent'),
            description: t('toast.successAddStudentDescription'),
            variant: "default",
          })
        } else {
          console.log("add failed with status: ", response.status);
          toast({
            title: t('toast.errorAddStudent'),
            description: t('toast.errorAddStudentDescription'),
            variant: "destructive",
          })
        }

        return new Response(
          JSON.stringify({
            message: "success",
          }),
          { status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            message: error,
          }),
          { status: 500 }
        );
      } finally {
        router.push(`/teacher/class-roster/${classroomId}`)
      }
    } else {
      toast({
        title: t('toast.emailNotFound'),
        description:
          t('toast.emailNotFoundDescription'),
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
      handleAddStudent(classroomId, data.email as string);
    }
  };

  return (
    <div>
      <Card className="flex flex-col items-center justify-center">
        <CardTitle className="mt-10 mb-4 text-3xl ">
          {t('title', { className: studentDataInClass[0].classroomName })} 
        </CardTitle>
        <CardDescription className="text-base mb-4">
          {t('description')}
        </CardDescription>
        <form ref={formRef} onSubmit={handleSubmit}>
          <CardContent className="flex flex-col items-center mb-8 overflow-auto md:w-full">
            <Card className="my-4 overflow-x-auto flex flex-col items-center justify-center">
              <div className="flex justify-center items-center mt-8 w-[90%]">
                <label htmlFor="email" className="text-base">
                  {t('email')}
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
                {t('addStudent')} <Icons.addUser className="w-5 ml-2" />
              </Link>
              <CardDescription className="text-center w-full m-4 p-4 mr-8 text-red-500 mb-16">
                {t('warning')}
              </CardDescription>
            </Card>
            <Button type="submit" variant={"default"} className=" mt-2">
              {t('saveButton')}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

