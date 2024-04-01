"use client";
import React, { useState, useEffect } from "react";
import { UserRole } from "@/types/constants";
import router from "next/router";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { set } from "lodash";
import { User } from "lucide-react";
import { UserAccountNav } from "../user-account-nav.jsx";
import { SelectedRoleContext } from "../../contexts/userRole-context";
import { useContext } from "react";

type Props = {
  userId: string;
};

const RoleSelected: React.FC<Props> = ({ userId }) => {
  // const [selectedRole, setSelectedRole] = React.useState<UserRole[]>([]);
  const [selectedRole, setSelectedRole] = useContext(SelectedRoleContext);
  let updatedRoles: UserRole[] = [];

  const handleRoleChange = async (role: UserRole) => {
    setSelectedRole((selectedRole: UserRole[]) => {
      if (selectedRole.includes(role)) {
        updatedRoles = selectedRole.filter((prevRole) => prevRole !== role);
        // return selectedRole.filter((prevRole) => prevRole !== role);
      } else {
        updatedRoles = [...selectedRole, role]; 
        // return [...selectedRole, role];
      }
      return updatedRoles;
    });

    try {
      if (!userId) {
        console.error("User id is not undefined");
        return;
      }

      const response = await axios.patch(`/api/users/${userId}/roles`, {
        selectedRole: updatedRoles,
        userId,
        
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
    } catch (error) {
      console.error("Failed to update user role", error);
    }
  };

  return (
    <div>
      <div className="w-full">
        {Object.values(UserRole).map((role, index) => (
          <div key={index}>
            <input
              type="checkbox"
              checked={selectedRole.includes(role)}
              onChange={() => handleRoleChange(role)}
              className="mr-2 my-2"
            />
            <label>{role}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelected;
