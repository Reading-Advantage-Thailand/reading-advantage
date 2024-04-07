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

type Props = {
  userId: string;
  role: string;
};

const FirstRoleSelection : React.FC<Props> = ({ userId }) => {
  const [selectedRole, setSelectedRole] = useContext(SelectedRoleContext);
const router = useRouter();

const onSelectRole = (role: UserRole) => {
    setSelectedRole([role]);
  }

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
    } else if (selectedRole.includes("TEACHER")) {
        router.push("/teacher/my-classes");
    } else if (selectedRole.includes("ADMIN")){
        router.push("/");
    } else if (selectedRole.includes("SYSTEM")){
        router.push("/");
    }
    } catch (error) {
      console.error("Failed to update user role", error);
    }
  };

  return (
    <div>
    <div className="w-full">
        {/* <Card>
            <CardHeader>    
                <CardTitle className="font-bold text-2xl md:text-2xl">
                    Role Selection
                </CardTitle>
                <CardDescription>
                    Please select the role
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={selectedRole}
                    onChange={(event) => onSelectRole(event.target.value as UserRole)}
                >
                    {Object.values(UserRole).map((role, index) => (
                        <FormControlLabel
                            key={index}
                            value={role}
                            control={<Radio />}
                            label={role}
                        />
                    ))}
                </RadioGroup>
                <Button
                variant='default'
                size='lg'
                className="mt-4"
                onClick={() => handleRoleChange(selectedRole)}
                >
                    Save
                </Button>
            </CardContent>
    </Card>     */}

<Card className="flex flex-col items-center">
            <CardHeader className="text-center">    
                <CardTitle className="font-bold text-2xl md:text-2xl ">
                   What do you want to do?
                </CardTitle>
                <CardDescription>
                    Please select the role
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className={cn(buttonVariants({ variant: "secondary" }), "mt-4 mr-4")} 
                size='lg'
                onClick={() => onSelectRole(UserRole.STUDENT)}
              >
                I want to learn
              </Button>
              <Button
               className={cn(buttonVariants({ variant: "secondary" }), "mt-4")}
                size='lg'
                onClick={() => onSelectRole(UserRole.TEACHER)}
                >
                    I want to teach
                </Button>
                </CardContent>
                <CardFooter>
                <Button
                variant='default'
                size='lg'
                className="mt-4"
                onClick={() => handleRoleChange(selectedRole)}
                >
                    Save
                </Button>
                </CardFooter>
           
    </Card> 
    </div>
  </div>
  );
};

export default FirstRoleSelection;