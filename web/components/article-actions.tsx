'use client';
import React from 'react'
import { Button } from "./ui/button";
import { Article } from "@/components/models/article-model";
import { title } from 'process';
import { toast } from './ui/use-toast';

type Props = {
    article: Article;
    articleId: string;
    userId: string;
    userRole: string;   
  };

export default function ArticleActions({ article, articleId, userId, userRole }: Props) {
    if (!userRole.includes("SYSTEM")) return null;

    const handleDelete = (articleId: string) => {
        console.log(`Deleted article with ID: ${articleId}`);
      };
    
      const handleApprove = (articleId: string) => {
        console.log(`Approved article with ID: ${articleId}`);
        toast({
            title: "Article Approved",
            description: "The  article has been approved",
        })

      };
  return (
    <div className='flex gap-4 mb-4 ml-4'>
      <Button onClick={()=> handleDelete(articleId)}>
        Delete
      </Button>
      <Button onClick={() => handleApprove(articleId)}>
        Approve
      </Button>
    </div>
  )
}


