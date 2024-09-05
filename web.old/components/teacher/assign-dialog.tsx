"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Article } from "@/components/models/article-model";
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
    navigator.clipboard
      .writeText(articleUri)
      .then(() => {
        toast({
          title: "Link copied to clipboard",
          description: "successfully copied to clipboard",
        });
        setShow(true);
      })
      .catch(() => {
        toast({
          title: "Link not copied to clipboard",
          description: "could not be copied to clipboard",
        });
      });
  };

  return (
    <div>
      <div className="flex gap-4">
        <Button className="mb-4 ml-5" onClick={handleShow}>
          Copy Link
        </Button>
      </div>
    </div>
  );
}
