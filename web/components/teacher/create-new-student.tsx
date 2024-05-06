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
import { Table, TableHeader } from "@/components/ui/table";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";

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
        <Tabs.Root>
          <Tabs.List className="h-fit grid grid-cols-1 md:grid-cols-2 bg-[#3882fd]">
            <Tabs.Trigger className="mr-2" value="class code">
              Class Code
            </Tabs.Trigger>
            <Tabs.Trigger value="manually">Manually</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            value="class code"
            className="flex flex-col items-center"
          >
            <Card className="flex flex-col items-center justify-center my-4">
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
                  className="border bg-gray-200 p-2 rounded h-[60px] text-center text-3xl"
                />
              </CardContent>
              <CardFooter className="mb-4 text-[#3882fd] cursor-pointer">
                <Link href="">Download handout</Link>
              </CardFooter>
            </Card>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-3xl flex justify-center">
              Done
            </button>
          </Tabs.Content>

           {/* manually */}
          <Tabs.Content value="manually">
            <CardDescription className="flex justify-end">
              Import from CSV
            </CardDescription>
            <Card className="flex flex-col items-center justify-center my-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell className="p-2 w-[164px]">Header 1</TableCell>
                    <TableCell className="p-2 w-[164px]">Header 2</TableCell>
                    <TableCell className="p-2 w-[164px]">Header 3</TableCell>
                    <TableCell className="p-2 w-[164px]">Header 4</TableCell>
                    <TableCell className="p-2 w-[164px]">Header 5</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="flex">
                  {/* <div className="flex">
    <input type="text" placeholder="Data 1" className="hover:border-none border-b p-3 m-2"/>
    <input type="text" placeholder="Data 1" className="hover:border-none border-b p-3 m-2"/>
    <input type="text" placeholder="Data 1" className="hover:border-none border-b p-3 m-2"/>
        </div> */}
                  <TableCell className="border-b-0">
                    <input
                      type="text"
                      placeholder="Data 1"
                      className="hover:border-none border-b p-1"
                    />
                  </TableCell>
                  <TableCell className="border-b-0">
                    <input
                      type="text"
                      placeholder="Data 1"
                      className="hover:border-none border-b p-1"
                    />
                  </TableCell>
                  <TableCell className="border-b-0">
                    <input
                      type="text"
                      placeholder="Data 1"
                      className="hover:border-none border-b p-1"
                    />
                  </TableCell>
                  <TableCell className="border-b-0">
                    <input
                      type="text"
                      placeholder="Data 1"
                      className="hover:border-none border-b p-1"
                    />
                  </TableCell>
                  <TableCell className="border-b-0">
                    <input
                      type="text"
                      placeholder="Data 1"
                      className="hover:border-none border-b p-1"
                    />
                  </TableCell>
                </TableBody>
              </Table>
            </Card>
            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
              Add Student
            </button>
          </Tabs.Content>
        </Tabs.Root>
        <CardContent></CardContent>
      </Card>
    </div>
  );
}

export default CreateNewStudent;
