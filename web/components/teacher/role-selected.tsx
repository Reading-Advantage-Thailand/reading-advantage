"use client";
import React from "react";
import { UserRole } from "@/types/constants";
import axios from "axios";
import { SelectedRoleContext } from "../../contexts/userRole-context";
import { useContext } from "react";

type Props = {
  userId: string;
  role: string;
};

const RoleSelected: React.FC<Props> = ({ userId }) => {
  // const [selectedRole, setSelectedRole] = React.useState<UserRole[]>([]);
  const [selectedRole, setSelectedRole] = useContext(SelectedRoleContext);
  let updatedRoles: UserRole[] = [];

  const handleRoleChange = async (role: UserRole) => {
    setSelectedRole((selectedRole: UserRole[]) => {
      if (selectedRole.includes(role)) {
        updatedRoles = selectedRole.filter((prevRole) => prevRole !== role);
      } else {
        updatedRoles = [...selectedRole, role]; 
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
