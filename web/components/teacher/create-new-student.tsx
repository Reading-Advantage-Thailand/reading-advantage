"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/icons";

function CreateNewStudent() {
  const classroomName = "Math 101";
  const classCode = "ABC123";
  const [inputs, setInputs] = useState(0);

const handleAddStudent = () => {
    console.log("Add student");
    
}
  return (
    <div>
      <Card className="flex flex-col items-center justify-center">
        <CardTitle className="mt-10 mb-4 text-3xl text-[#3882fd]">
          Add new students to {classroomName}
        </CardTitle>
        <CardDescription className="text-base mb-4">
          There are two ways to add students to the classroom
        </CardDescription>
        {/* <Tabs.Root> */}
          {/* <div className="flex justify-center items-center">
            <Tabs.List className="h-fit w-fit grid grid-cols-2 md:grid-cols-2 rounded-full border-4 overflow-x-auto border-[#314265]">
              <Tabs.Trigger
                className="focus:text-white focus:bg-[#314265] rounded-l-full p-2"
                value="class code"
              >
                Send Code
              </Tabs.Trigger>
              <Tabs.Trigger
                value="manually"
                className=" focus:text-white focus:bg-[#314265]  rounded-r-full p-2"
              >
                Add Manually
              </Tabs.Trigger>
            </Tabs.List>
          </div> */}
          {/* class code */}
          {/* <Tabs.Content
            value="class code"
            className="flex flex-col items-center"
          >
            <Card className="flex flex-col items-center justify-center my-4 ">
              <CardContent className="text-base overflow-auto text-center w-[67%] mt-8">
                Share this class code with your students.
                <br />
                They can enter the code when they sign up and they will
                automatically join the class you have just created.
              </CardContent>
              <CardContent className="flex flex-col mt-6">
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
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full border-2 border-[#314265]">
              Done
            </button>
          </Tabs.Content> */}

          {/* manually */}
          <CardContent
            // value="manually"
            className="flex flex-col items-center mb-8"
          >
            {/* <div className="flex ml-auto mr-[10%] cursor-pointer text-[#3882fd]">
              Import from CSV
            </div> */}
              <Card className="my-4">
                <Table>
                  <TableHeader>
                    <TableRow className="h-[50px]">
                      <TableCell className="p-4">First Name</TableCell>
                      <TableCell className="p-4">Last Name</TableCell>
                      <TableCell className="p-4">Email</TableCell>
                      <TableCell className="p-4">User Name</TableCell>
                      <TableCell className="p-4">Password</TableCell>
                    </TableRow>
                  </TableHeader>
                  {Array.from({ length: inputs }).map(
                    (_: any, index: number) => (
                      <TableBody key={index}>
                        <TableCell>
                          <input
                            type="text"
                            placeholder="First Name"
                            className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent "
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="text"
                            placeholder="Last Name"
                            className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent"
                            onInvalid={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              e.target.setCustomValidity(
                                "Last Name is required"
                              );
                            }}
                            onInput={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
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
                    )
                  )}
                  <TableBody>
                    <TableCell>
                      <input
                        type="text"
                        placeholder="First Name"
                        className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent overflow-x-auto"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent overflow-x-auto"
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
                        className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent overflow-x-auto"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        placeholder="User Name"
                        className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent overflow-x-auto"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        placeholder="Password"
                        className="hover:border-none border-b p-2 focus:outline-none focus:border-transparent overflow-x-auto"
                      />
                    </TableCell>
                  </TableBody>
                </Table>
                <Link
                  href=""
                  className="flex justify-end m-4 p-4 text-[#3882fd] cursor-pointer"
                  onClick={() => setInputs((prevInputs) => prevInputs + 1)}
                >
                  Add new student <Icons.addUser className="w-5 ml-2" />
                </Link>
                <CardDescription className="text-center w-full m-4 p-4 mr-8 text-red-500 mb-16">
                  To add a student, please fill in the required fields above.
                </CardDescription>
              </Card>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full mt-2 flex border-2 border-[#314265]" onClick={handleAddStudent}>
              SAVE AND CONTINUE
            </button>
            <CardDescription className="text-center overflow-auto mt-8 md:w-[85%] lg:w-50%]">
              * Clicking the save button will create these student accounts and
              you will receive an email with a file containing these credentials
              for future use. If you do not see the email in a few minutes,
              check your 'junk mail', 'spam' or 'promotions' folder.
            </CardDescription>
          </CardContent>
        {/* </Tabs.Root> */}
      </Card>
    </div>
  );
}

export default CreateNewStudent;
