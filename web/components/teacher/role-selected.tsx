"use client";
import React, { useEffect, useContext } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { UserRole } from "../../types/index.d.ts";
import router from "next/router";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
// import { getCurrentUser } from "@/lib/session";
import { set } from "lodash";
import axios from "axios";

type Props = {
    userId: string;
};

const RoleSelected: React.FC<Props>= ({ userId }) => {
  const [selectedRole, setSelectedRole] = React.useState<UserRole | "">("");
  const router = useRouter();

  const handleRoleChange = async (role: UserRole ) => {
    setSelectedRole(role);
    if (role === UserRole.TEACHER) {
        router.push("/teacher/my-classes");
    }
    
    if (role === UserRole.STUDENT) {
        router.push("/student/read");
    }    
        try {
//   const user = await getCurrentUser();    
  // update user role to the database
  if (!userId) {
    console.error("User id is not undefined");
    return;
  }

const response = await axios.patch(`/api/user/${userId}/roles`, {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, userId }),
});

if (response.status !== 200) {
    throw new Error(`HTTP error! status: ${response.status}`);
}

const data = response.data;
console.log(data);
} catch (error) {
  console.error("Failed to update user role", error);
}

 
   

  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full">
            {selectedRole || "Selected role"}{" "}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-full">
            {Object.values(UserRole).map((role, index) => (
                <DropdownMenuCheckboxItem
                    key={index}
                    checked={selectedRole === role}
                    onCheckedChange={() => {
                        handleRoleChange(role);
                    }}
                >
                    {role}
                </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RoleSelected;
