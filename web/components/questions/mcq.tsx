'use client';
import React, { useContext } from 'react'
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Icons } from '../icons'
import { Button } from '../ui/button'
import { QuizContextProvider, QuizContext } from '@/contexts/quiz-context';
import { MCQType } from '@/types';
import axios from 'axios';
import { toast } from '../ui/use-toast';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useScopedI18n } from '@/locales/client';

type Props = {
    mcqs: MCQType[],
    articleId: string,
    userId: string,
    articleTitle: string,
    isQuizCompleted: boolean,
    loadingUpdateUserArticleRecord: boolean,
    onQuizCompleted: () => void,
    className?: string,

}

export default function MCQ({
    mcqs,
    articleId,
    userId,
    articleTitle,
    onQuizCompleted,
    className,
    isQuizCompleted,
    loadingUpdateUserArticleRecord,
}: Props) {
    const t = useScopedI18n('components.mcq');
    return (
        <Card className={cn(className)}>
            <QuizContextProvider>
                <CardContent>
                    <Quiz
                        isQuizCompleted={isQuizCompleted}
                        loadingUpdateUserArticleRecord={loadingUpdateUserArticleRecord}
                        articleTitle={articleTitle}
                        mcqs={mcqs}
                        articleId={articleId}
                        userId={userId}
                        onQuizCompleted={onQuizCompleted}
                    />
                </CardContent>
            </QuizContextProvider>
        </Card>
    )
}

interface QuizProps {
    loadingUpdateUserArticleRecord: boolean,
    isQuizCompleted: boolean,
    mcqs: MCQType[],
    articleId: string,
    userId: string,
    articleTitle: string,
    onQuizCompleted: () => void,
}

function Quiz({
    mcqs,
    isQuizCompleted,
    loadingUpdateUserArticleRecord,
    articleId,
    userId,
    articleTitle,
    onQuizCompleted,
}: QuizProps) {
    const t = useScopedI18n('components.mcq');
    const { timer, setPaused } = useContext(QuizContext);

    const [loading, setLoading] = React.useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [correctAnswer, setCorrectAnswer] = React.useState<string>('');
    const [isAnswered, setIsAnswered] = React.useState(false);
    const [correctAnswers, setCorrectAnswers] = React.useState<string[]>([]); // Use an array to track correct answers

    const instance = axios.create({
        baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}`,
        timeout: 1000,
    })

    function onNextQuestion() {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnswered(false);
    }

    async function nextQuestion(answer: string) {
        setIsAnswered(true);
        if (isAnswered) return;
        const descriptorId = mcqs[currentQuestionIndex].descriptor_id;
        try {
            setLoading(true)
            const res = await axios.post(
                `/api/articles/${articleId}/questions/${descriptorId}`, {
                answer,
                timeRecorded: timer,
            })
            console.log(res.data.data)
            setCorrectAnswer(res.data.data.correctAnswer)
            if (res.data.data.isCorrect) {
                setCorrectAnswers([...correctAnswers, res.data.data.correctAnswer]); // Add true for correct answer
                toast({
                    title: t('toast.correct'),
                    description: t('toast.correctDescription'),
                })
            } else {
                setCorrectAnswers([...correctAnswers, '']); // Add false for incorrect answer
                toast({
                    title: t('toast.incorrect'),
                    description: t('toast.incorrectDescription'),
                })
            }
            if (currentQuestionIndex === mcqs.length - 1) {
                //pause timer
                setPaused(true);
            }
        } catch (error) {
            toast({
                title: t('toast.error'),
                description: t('toast.errorDescription'),
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <div className='flex gap-2 items-end mt-6'>
                <Badge className="flex-1" variant="destructive">
                    {t('elapsedTime', {
                        time: timer,
                    })}
                </Badge>
                {mcqs.map((question, index) => {
                    if (correctAnswers[index]) {
                        return <Icons.correctChecked key={index} className='text-green-500' size={22} />
                    } else if (correctAnswers[index] === '') {
                        return <Icons.incorrectChecked key={index} className='text-red-500' size={22} />
                    }
                    return <Icons.unChecked key={index} className='text-gray-500' size={22} />
                })}
            </div>
            <CardTitle className='font-bold text-3xl md:text-3xl mt-3'>
                {t('questionHeading', {
                    number: currentQuestionIndex + 1,
                    total: mcqs.length,
                })}
            </CardTitle>
            <CardDescription className='text-2xl md:text-2xl mt-3'>
                {mcqs[currentQuestionIndex].question}
            </CardDescription>
            <div className='flex flex-col'>
                {mcqs[currentQuestionIndex].answers.map((answer, index) => {
                    return (
                        <Button key={index}
                            className={cn(
                                "mt-2 h-auto",
                                correctAnswer === answer && "bg-green-500 hover:bg-green-600",
                            )}
                            disabled={loading}
                            onClick={() => nextQuestion(answer)}>
                            <p className='w-full text-left'>
                                {index + 1}. {answer}
                            </p>
                        </Button>
                    )
                })}
            </div>
            {mcqs.length - 1 !== currentQuestionIndex ? (
                <Button className='mt-4' variant='outline' disabled={!isAnswered || loading} size='sm' onClick={onNextQuestion}>
                    {t('nextQuestionButton')}
                </Button>
            ) : (
                <Button className='mt-4' variant='outline' onClick={onQuizCompleted} disabled={isQuizCompleted || loadingUpdateUserArticleRecord || loading} size='sm'>
                    finish quiz
                </Button>
            )
            }
        </>
    )
}