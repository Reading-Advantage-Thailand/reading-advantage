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
import { Icons } from "@/components/icons";
import { toast } from "../ui/use-toast";

type Props = {
  article: Article;
  articleId: string;
  userId: string;
};

export default function AssignDialog({ article, articleId, userId }: Props) {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    const articleUri = `https://app.reading-advantage.com/en/student/read/${articleId}`;
    navigator.clipboard.writeText(articleUri).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "successfully copied to clipboard",
      });
      setShow(true);
    }).catch(() => {
      toast({
        title: "Link not copied to clipboard",
        description: "could not be copied to clipboard",
      });
    });
  };

  const handleClose = () => {
    setShow(false);
  };
  return (
    <div>
      {/* <Button className="mb-4 ml-5" onClick={handleShow}>
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
      </Dialog> */}
<div className="flex gap-4">
      <Button className="mb-4 ml-5" onClick={handleShow}>
        Copy Link
      </Button>
</div>
    </div>
  );
}
