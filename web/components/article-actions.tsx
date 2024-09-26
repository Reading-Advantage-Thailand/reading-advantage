"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Article } from "@/components/models/article-model";
import { toast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  article: Article;
  articleId: string;
};

export default function ArticleActions({ article, articleId }: Props) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleDelete = async (articleId: string) => {
    console.log(`Deleted article with ID: ${articleId}`);
    try {
      await fetch(`/api/v1/passage/${articleId}`, { method: "DELETE" });
      setOpen(false);
      toast({
        title: "Article Deleted",
        description: `The article with title: ${article.title} has been deleted`,
      });
    } catch (error) {
      console.error(`Failed to delete article with ID: ${articleId}`, error);
      toast({
        title: "Error",
        description: `Failed to delete article with title: ${article.title}`,
        variant: "destructive",
      });
    }
  };

  const handleApprove = (articleId: string) => {
    console.log(`Approved article with ID: ${articleId}`);
    toast({
      title: "Article Approved",
      description: "The  article has been approved",
    });
  };

  return (
    <div className="flex gap-4 mb-4 ml-4">
      <Button
        onClick={() => {
          handleOpen();
        }}
      >
        Delete
      </Button>
      <Button onClick={() => handleApprove(articleId)}>Approve</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete article &quot;{article.title}&quot;
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this article?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => handleDelete(articleId)}
            >
              Delete
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
