"use client";
import React from "react";
import { UserRole } from "@/types/constants";
import axios from "axios";
import { SelectedRoleContext } from "../contexts/userRole-context";
import { useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button, buttonVariants } from "../components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScopedI18n } from "@/locales/client";
import { toast } from "./ui/use-toast";

type Props = {
  userId: string;
  role: string;
};

const FirstRoleSelection: React.FC<Props> = ({ userId }) => {
  const [selectedRole, setSelectedRole] = useContext(SelectedRoleContext);
  const router = useRouter();
  const t = useScopedI18n("components.firstRoleSelection");

  const onSelectRole = (role: UserRole) => {
    setSelectedRole([role]);
  };

  const handleRoleChange = async (role: UserRole) => {
    try {
      if (!userId) {
        console.error("User id is not undefined");
        return;
      }

      const response = await axios.patch(`/api/users/${userId}/roles`, {
        selectedRole: role,
        userId,

        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;

      if (selectedRole.includes("STUDENT")) {
        router.push("/level");
        toast({
          title: t('toast.title'),
          description: t('toast.studentDescription'),
        })
      } else if (selectedRole.includes("TEACHER")) {
        router.push("/teacher/my-classes");
        toast({
          title: t('toast.title'),
          description: t('toast.teacherDescription'),
        })
      } else if (selectedRole.includes("ADMIN")) {
        router.push("/");
        toast({
          title: t('toast.title'),
          description: t('toast.adminDescription'),
        })
      } else if (selectedRole.includes("SYSTEM")) {
        router.push("/");
        toast({
          title: t('toast.title'),
          description: t('toast.systemDescription'),
        })
      }
    } catch (error) {
      console.error("Failed to update user role", error);
    }
  };

  return (
    <div>
      <div className="w-full">
        <Card className="flex flex-col items-center">
          <CardHeader className="text-center">
            <CardTitle className="font-bold text-2xl md:text-2xl ">
              {t("heading")}
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "mt-4 mr-4"
              )}
              size="lg"
              onClick={() => onSelectRole(UserRole.STUDENT)}
            >
              {t("studentButton")}
            </Button>
            <Button
              className={cn(buttonVariants({ variant: "secondary" }), "mt-4")}
              size="lg"
              onClick={() => onSelectRole(UserRole.TEACHER)}
            >
              {t("teacherButton")}
            </Button>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              size="lg"
              className="mt-4"
              onClick={() => handleRoleChange(selectedRole)}
            >
              {t("save")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FirstRoleSelection;
