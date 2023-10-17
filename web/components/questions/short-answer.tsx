'use client'
import React, { useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useScopedI18n } from '@/locales/client';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '../ui/button';
import { QuizContext, QuizContextProvider } from '@/contexts/quiz-context';
import { Badge } from '../ui/badge';
import { Icons } from '../icons';
import TextareaAutosize from "react-textarea-autosize";
import { toast } from '../ui/use-toast';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import axios from 'axios';
import { ShortAnswerType } from '@/types';
import { size } from 'lodash';
import { RateDialog } from './rate';

type Props = {
    shortAnswer: ShortAnswerType,
    articleId: string,
    userId: string,
    className?: string,
}

const shortAnswerSchema = z.object({
    'answer': z.string()
        .min(1,
            {
                message: 'Answer is required'
            }).max(1000, {
                message: 'Answer must be less than 1000 characters'
            }),
})

type FormData = z.infer<typeof shortAnswerSchema>

export default function ShortAnswer({
    articleId,
    userId,
    className,
    shortAnswer,
}: Props) {
    const t = useScopedI18n('components.mcq');
    const [step, setStep] = React.useState(0);

    function nextStep() {
        setStep(step + 1)
    }

    return (
        <Card className={cn(className)}>
            <QuizContextProvider>
                <CardContent>
                    <ShortAnswerQuestion
                        articleId={articleId}
                        shortAnswer={shortAnswer}
                        userId={userId}
                    />
                </CardContent>
            </QuizContextProvider>
        </Card>
    )
}


type ShortAnswerQuestionProps = {
    shortAnswer: ShortAnswerType,
    articleId: string,
    userId: string,
}

function ShortAnswerQuestion({
    shortAnswer,
    articleId,
    userId,
}: ShortAnswerQuestionProps) {
    const t = useScopedI18n('components.mcq');
    const { timer, setPaused } = useContext(QuizContext);
    const [isSaving, setIsSaving] = React.useState<boolean>(false)
    const [isCompleted, setIsCompleted] = React.useState<boolean>(false)
    const { register, handleSubmit } = useForm<FormData>({
        resolver: zodResolver(shortAnswerSchema),
    })

    async function onSubmit(data: FormData) {
        try {
            console.log('testttttt');
            console.log('data', data);
            setIsSaving(true)

            // console.log('data', data.values);
            const response = await axios.patch(`/api/articles/${articleId}/questions/short-answer`, {
                answer: data.answer,
                timeRecorded: timer,
            })

            setIsCompleted(true)
            // router.refresh()
            setPaused(true);
            return toast({
                description: "Your short answer has been saved.",
            })
        } catch (error) {
            setIsSaving(false)
            console.log('error', error);
            return toast({
                title: "Something went wrong.",
                description: "Your short answer was not saved. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }

    }
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='flex gap-2 items-end mt-6'>
                    <Badge className="flex-1" variant="destructive">
                        {t('elapsedTime', {
                            time: timer,
                        })}
                    </Badge>
                </div>
                <CardTitle className='flex font-bold text-3xl md:text-3xl mt-3'>
                    Short Answer Question
                </CardTitle>
                <CardDescription className='text-2xl md:text-2xl mt-3'>
                    {shortAnswer.question}
                </CardDescription>
                <TextareaAutosize
                    autoFocus
                    disabled={isCompleted}
                    id="short-answer"
                    placeholder="Type your answer here..."
                    className="w-full my-3 p-3 rounded-sm resize-none appearance-none overflow-hidden bg-gray-100 dark:bg-gray-900 focus:outline-none"
                    {...register("answer")}
                />
                {
                    isCompleted ? (
                        <>
                            <p className="text-xl font-bold">
                                Suggested Answer
                            </p>
                            <p className="text-muted-foreground mb-3" >
                                {shortAnswer.suggestedAnswer}
                            </p>
                            <RateDialog
                                articleId={articleId}
                                userId={userId}
                            />
                        </>
                    ) : (
                        <button type="submit" className={cn(buttonVariants({
                            size: 'sm',
                            variant: 'outline',
                        }),)}>
                            {isSaving && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <span>Save</span>
                        </button>
                    )
                }

            </form>
        </>
    )
}