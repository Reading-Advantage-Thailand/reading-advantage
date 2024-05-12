'use client';
import React, {useState} from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ArticleType } from "@/types";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";


type Props = {
    article: ArticleType;
    articleId: string;
    userId: string;
}

export default function AssignDialog({article, articleId, userId}: Props) {
      const [show, setShow] = useState(false);

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
    };
  return (
    <div>   
    <Button className="mt-4" onClick={handleShow}>Assign</Button>
        <Dialog open={show} onOpenChange={handleClose}>
                    <DialogContent className='text-center'>
                    <DialogTitle>Assign :</DialogTitle>
                    <DialogTitle>{article.title}</DialogTitle>
                    <p>Class</p>
                   <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button>Choose Class</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuCheckboxItem>Class 1</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Class 2</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Class 3</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                   </DropdownMenu>
                    </DialogContent>
              </Dialog>
    </div>
  )
}
