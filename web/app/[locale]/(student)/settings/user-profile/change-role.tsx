"use client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Role } from "@/server/models/enum";
import { set } from "lodash";
import { UserCircle, GraduationCap, School } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { use, useState } from "react";

type Props = {
  userId: string;
  userRole: Role;
  className?: string;
};

const roles = [
  {
    title: "Student",
    description:
      "The Student role is designed for users who are enrolled in courses and participating in learning activities.",
    icon: <UserCircle size={32} />,
    value: Role.STUDENT,
  },
  {
    title: "Teacher",
    description:
      "The Teacher role is intended for users who are responsible for delivering course content and evaluating student performance.",
    icon: <GraduationCap size={32} />,
    value: Role.TEACHER,
  },
  // {
  //   title: "Admin",
  //   description:
  //     "The Admin role is for users who manage the overall system and have access to all administrative functions.",
  //   icon: <School size={32} />,
  //   value: Role.ADMIN,
  // },
];

export default function ChangeRole({ userId, userRole, className }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(userRole);
  const { update } = useSession();
  const router = useRouter();

  async function handleRoleChange() {
    try {
      setIsLoading(true);
      // Update the user's role
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role.");
      }

      // update user session token
      await update({ user: { role: selectedRole } })
        .then(() => {
          console.log("Role updated in session.");
        })
        .catch((error) => {
          console.error("Failed to update role in session.", error);
        });

      // refresh the page
      router.refresh();

      toast({
        title: "Role updated.",
        description: `Changed role to ${selectedRole}.`,
      });
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-primary">Roles</CardTitle>
        <CardDescription>
          Each role in our system has specific permissions and responsibilities
          associated with it. And your current role is{" "}
          <strong className="dark:text-blue-500">{userRole}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {roles.map((role, index) => (
          <RoleSelectionItem
            onClick={() => setSelectedRole(role.value)}
            key={index}
            {...role}
            isSelected={role.value === selectedRole}
          />
        ))}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground text-[0.8rem] mt-3">
          Changing your role will affect the permissions and access you have on
          the platform.
        </p>
        <Button
          variant="secondary"
          size="sm"
          disabled={isLoading || userRole === selectedRole}
          onClick={handleRoleChange}
        >
          {isLoading && (
            <span className="mr-2">
              <Icons.spinner className="h-4 w-4 animate-spin" />
            </span>
          )}
          Update role to {selectedRole}
        </Button>
      </CardFooter>
    </Card>
  );
}

const RoleSelectionItem = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={cn(
      "relative overflow-hidden rounded-lg border shadow-2x hover:shadow-3x cursor-pointer hover:bg-secondary",
      isSelected && "dark:bg-blue-900 hover:dark:bg-blue-800"
    )}
  >
    <div className="flex flex-col justify-between rounded-md p-3">
      {icon}
      <div className="space-y-1 mt-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);
