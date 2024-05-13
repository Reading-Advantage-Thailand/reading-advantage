"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Article } from "@/components/models/article-model";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  article: Article;
  articleId: string;
  userId: string;
};
const mockClassrooms = [
  {
    id: "1",
    name: "Class 1",
  },
  {
    id: "2",
    name: "Class 2",
  },
  {
    id: "3",
    name: "Class 3",
  },
];

export default function AssignDialog({ article, articleId, userId }: Props) {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };
  return (
    <div>
      <Button className="mb-4 ml-5" onClick={handleShow}>
        Assign
      </Button>
      <Dialog open={show} onOpenChange={handleClose}>
        <DialogContent className="text-center">
          <DialogTitle>Assign :</DialogTitle>
          <DialogTitle>{article.title}</DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger>
            Choose Class: 
              <Button variant="outline" className="ml-2">
            <select>
              {mockClassrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </DialogContent>
      </Dialog>
    </div>
  );
}
