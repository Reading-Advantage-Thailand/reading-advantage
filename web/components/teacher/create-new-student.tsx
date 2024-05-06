"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableCell, TableBody, TableRow, TableHead } from "@/components/ui/table";
// import { TableBody,  TableHead, TableRow } from "@mui/material";

function CreateNewStudent() {
  const [open, setOpen] = useState(false);
  const classroomName = "Math 101";
  const classCode = "ABC123";

  return (

    <div>
      <Card className="flex flex-col items-center justify-center">
        <CardTitle className="mt-10 mb-4 text-3xl text-[#3882fd]">
          Add new students to {classroomName}
        </CardTitle>
        <CardDescription className="text-base mb-4">
          There are two ways to add students to the classroom
        </CardDescription>
        <Tabs.Root className="mx-[10%]">
          <Tabs.List className="h-fit grid grid-cols-2 md:grid-cols-2 bg-[#3882fd]">
            <Tabs.Trigger className="mr-2" value="class code">
              Class Code
            </Tabs.Trigger>
            <Tabs.Trigger value="manually">Manually</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            value="class code"
            className="flex flex-col items-center w-full"
          >
            <Card className="flex flex-col items-center justify-center my-4 ">
              <div className="space-y-2 flex flex-col items-center overflow-auto mt-8 w-[67%]">
                <CardContent className="text-base overflow-auto text-center">
                  Share this class code with your students.
                  <br />
                  They can enter the code when they sign up and they will
                  automatically join the class you have just created.
                </CardContent>
              </div>
              <CardContent className="flex flex-col w-[50%] mt-6">
                Class Code:{" "}
                <input
                  type="text"
                  value={classCode}
                  readOnly
                  className="border bg-gray-200 p-1 rounded h-[60px] text-center text-3xl"
                />
              </CardContent>
              <CardFooter className="mb-4 text-[#3882fd] cursor-pointer">
                <Link href="">Download handout</Link>
              </CardFooter>
            </Card>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full flex justify-center">
              Done
            </button>
          </Tabs.Content>
   
           {/* manually */}
            <CardDescription className="flex justify-end mr-[10%]">
              Import from CSV
            </CardDescription>
          <Tabs.Content value="manually" className="flex flex-col items-center mb-8 ">
            <Card className="flex flex-col items-center justify-center my-4 w-[90%]">
              <Table>
                <TableHeader>
                  <TableRow className="h-[50px]">
                    <TableCell className="p-4 ">First Name</TableCell>
                    <TableCell className="p-4 ">Last Name</TableCell>
                    <TableCell className="p-4 ">Email</TableCell>
                    <TableCell className="p-4 ">User Name</TableCell>
                    <TableCell className="p-4 ">Password</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody >
                  <TableCell>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent "
                    />
                  </TableCell>
                <TableCell >
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent"
                        onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.target.setCustomValidity("Last Name is required");
                        }}
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.target.setCustomValidity("");
                        }}
                    />
                </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      placeholder="Email(Optional)"
                      className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      placeholder="User Name"
                      className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      placeholder="Password"
                      className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent"
                      />
                  </TableCell>
                </TableBody>
              </Table>
                      <CardDescription className="flex justify-end w-full m-4 p-4 mr-8 text-[#3882fd] cursor-pointer">Add new student</CardDescription>
                      <CardDescription className="text-center w-full m-4 p-4 mr-8 text-red-500 mb-16">To add a student, please fill in the required fields above.
</CardDescription>
            </Card>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full mt-2">
              SAVE AND CONTINUE
            </button>
            <CardDescription className="space-y-2 text-center overflow-auto mt-8 w-[67%]">
            * Clicking the save button will create these student accounts and you will receive an email with a file containing these credentials for future use. If you do not see the email in a few minutes, check your 'junk mail', 'spam' or 'promotions' folder.
            </CardDescription>
          </Tabs.Content>
        </Tabs.Root>
        {/* <CardContent></CardContent> */}
      </Card>
    </div>
  );
}

export default CreateNewStudent;
