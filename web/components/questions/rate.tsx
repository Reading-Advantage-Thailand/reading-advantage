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
import { toast } from "../ui/use-toast";
import axios from "axios";
import Link from "next/link";
import { useScopedI18n } from "@/locales/client";


interface RateDialogProps {
    disabled?: boolean;
    userId: string;
    articleId: string,
}
export function RateDialog({
    disabled = false,
    userId,
    articleId,
}: RateDialogProps) {
    const t = useScopedI18n('components.rate');
    const [rating, setRating] = React.useState(-1);
    const [loading, setLoading] = React.useState(false);
    const [isRated, setIsRated] = React.useState(false);
    const [userLevel, setUserLevel] = React.useState(0);

    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_BASE_URL,
        timeout: 1000,
    });
    async function onUpdateUser() {
        if (rating === -1) return;
        const response = await instance.patch(`/api/users/${userId}/article-records`, {
            articleId,
            rating,
        })
        const data = await response.data;
        console.log(data);
        console.log(data.message === 'success')
        if (data.message === 'success') {
            toast({
                title: t('toast.success'),
                description: t('toast.successDescription', {
                    level: data.level,
                }),
            });
            setUserLevel(data.level);
            setIsRated(true);
        }
        setLoading(false)
    }
    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button disabled={disabled} size='sm' variant="outline">{t('title')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
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
                        <p className="flex items-center justify-center font-bold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" >
                            {t('newLevel', { level: userLevel })}
                        </p>
                    )
                }
                <DialogFooter>
                    {
                        !isRated ? (
                            <Button disabled={loading} onClick={onUpdateUser}>
                                {t('submitButton')}
                            </Button>)
                            :
                            (
                                <div className="flex gap-4 justify-center">
                                    <Button disabled={loading}>
                                        <Link href={`/student/history`}>{t('backToHomeButton')}</Link>
                                    </Button>
                                    <Button>
                                        <Link href={`/student/read`} >{t('nextQuizButton')}</Link>
                                    </Button>
                                </div>
                            )
                    }
                </DialogFooter>
            </DialogContent >

        </Dialog >
    )
}
