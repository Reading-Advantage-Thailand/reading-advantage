"use client";
import React from "react";
import { UserRole } from "@/types/constants";
import axios from "axios";
import { SelectedRoleContext } from "../../contexts/userRole-context";
import { useContext } from "react";
import { Button, buttonVariants } from "../../components/ui/button";

type Props = {
  userId: string;
  role: string;
};

const RoleSelected: React.FC<Props> = ({ userId }) => {
  const [selectedRole, setSelectedRole] = useContext(SelectedRoleContext);
  console.log("selectedRole", selectedRole);
  
  let updatedRoles: UserRole[] = [];

  const onSelectRole = (role: UserRole) => {
    setSelectedRole((selectedRole: UserRole[]) => {
      if (selectedRole.includes(role)) {
        updatedRoles = selectedRole.filter((prevRole) => prevRole !== role);
      } else {
        updatedRoles = [...selectedRole, role]; 
      }
      return updatedRoles;
    });
  }
  
  const handleRoleChange = async (updatedRoles:UserRole) => {

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
            id={role}
            name="role"
              type="checkbox"
              checked={selectedRole ? selectedRole.includes(role) : false}
              onChange={() => onSelectRole(role)}
              className="mr-2 my-2"
            />
            <label htmlFor={role}>{role}</label>
          </div>
        ))}
      </div>
      <Button
                variant='default'
                size='lg'
                className="mt-4"
                onClick={() => handleRoleChange(selectedRole)}
                >
                    Save
                </Button>
    </div>
  );
};

export default RoleSelected;
