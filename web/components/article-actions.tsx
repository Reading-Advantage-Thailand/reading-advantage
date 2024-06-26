'use client';
import React, { useState } from 'react'
import { Button } from "./ui/button";
import { Article } from "@/components/models/article-model";
import { title } from 'process';
import { toast } from './ui/use-toast';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Icons } from "@/components/icons";
import { useScopedI18n } from "@/locales/client";
import { set } from 'lodash';
import axios from 'axios';

type Props = {
    article: Article;
    articleId: string;
    userId: string;
    userRole: string;   
  };

export default function ArticleActions({ article, articleId, userId, userRole }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleClose = () => {
        setOpen(false);
      };

    const handleDelete = async (articleId: string) => {
      console.log(`Deleted article with ID: ${articleId}`);
      setOpen(false); 
      try {
        // await axios.delete(`/api/passage/${articleId}`);
        toast({
            title: "Article Deleted",
            description: `The article with title: ${article.title} has been deleted`,
        });
        router.push('/system');
    } catch (error) {
        console.error(`Failed to delete article with ID: ${articleId}`, error);
        toast({
            title: "Error",
            description: `Failed to delete article with title: ${article.title}`,
        });
    }
      };
    
      const handleApprove = (articleId: string) => {
        console.log(`Approved article with ID: ${articleId}`);
        toast({
            title: "Article Approved",
            description: "The  article has been approved",
        })
    router.push('/system')
      };

  return (
    <div className='flex gap-4 mb-4 ml-4'>
      <Button onClick={()=> {handleDelete(articleId), setIsClicked}}>
        Delete
      </Button>
      <Button onClick={() => handleApprove(articleId)}>
        Approve
      </Button>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span title="delete class">
        <Icons.delete
                  className="h-4 w-4 cursor-pointer"
                  aria-label="delete class"
                />
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete article {article.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this article?
          </DialogDescription>
          <DialogFooter>
            <Button variant="destructive" onClick={() => handleDelete(articleId)}>
              Delete
            </Button>
            <Button onClick={handleClose}>Cancle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


