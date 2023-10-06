'use client';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Rating } from "@mui/material";
import React from "react";
import { toast } from "./ui/use-toast";
import axios from "axios";
import { Link } from "next-intl";


interface RateDialogProps {
    disabled?: boolean;
    userId: string;
    articleId: string,
    articleTitle: string,
}
export function RateDialog({
    disabled = false,
    userId,
    articleId,
    articleTitle,
}: RateDialogProps) {
    const [rating, setRating] = React.useState(-1);
    const [loading, setLoading] = React.useState(false);
    const [isRated, setIsRated] = React.useState(false);
    const [userLevel, setUserLevel] = React.useState(0);

    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_URL,
        timeout: 1000,
    });
    async function onUpdateUser() {
        if (rating === -1) return;
        const response = await axios.patch(`/api/users/${userId}/article-records`, {
            title: articleTitle,
            articleId,
            rating,
        })
        const data = await response.data;
        console.log(data);
        console.log(data.message === 'success')
        if (data.message === 'success') {
            toast({
                title: "Success",
                description: `Your new level is ${data.level}.`,
            });
            setUserLevel(data.level);
            setIsRated(true);
        }
        setLoading(false)
    }
    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button className='mt-4' disabled={disabled} size='sm' variant="outline">Rate Article</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rate Article</DialogTitle>
                    <DialogDescription>
                        This rating is use for calculating your next level.
                    </DialogDescription>
                </DialogHeader>
                {
                    !isRated ? (
                        <div className="flex items-center justify-center">
                            <Rating
                                name="simple-controlled"
                                value={rating}
                                onChange={(event, newValue) => {
                                    setRating(newValue ? newValue : 0);
                                }}
                                size="large"
                            />
                        </div>
                    ) : (
                        <p className="flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-3xl font-bold text-transparent" >
                            {`Your new level is ${userLevel}.`}
                        </p>
                    )
                }
                <DialogFooter>
                    {
                        !isRated ? (
                            <Button disabled={loading} onClick={onUpdateUser}>
                                Submit
                            </Button>)
                            :
                            (
                                <div className="flex justify-center gap-4">
                                    <Button disabled={loading} onClick={onUpdateUser}>
                                        <Link href={`/student/home`}>Back to home</Link>
                                    </Button>
                                    <Button>
                                        <Link href={`/student/next-quiz`} >Next quiz</Link>
                                    </Button>
                                </div>
                            )
                    }

                </DialogFooter>
            </DialogContent >

        </Dialog >
    )
}
