'use client';
import React, { useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Icons } from './icons'
import { Button } from './ui/button'
import { QuizContextProvider, QuizContext } from '@/contexts/quiz-context';
import { Question } from '@/types';
import axios from 'axios';
import { toast } from './ui/use-toast';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { RateDialog } from './rate';
import { useScopedI18n } from '@/locales/client';

type Props = {
    mcq: Question[],
    articleId: string,
    userId: string,
    articleTitle: string,
    className?: string,
    isRequiz?: boolean,
}

export default function MCQ({
    mcq,
    articleId,
    userId,
    articleTitle,
    className,
    isRequiz,
}: Props) {
    const t = useScopedI18n('components.mcq');
    const [step, setStep] = React.useState(0);

    function nextStep() {
        setStep(step + 1)
    }

    return (
        <Card className={cn(className)}>
            {step === 0 ? (
                <>
                    <CardHeader>
                        <CardTitle className='font-bold text-3xl md:text-3xl'>
                            {isRequiz ? t('reQuiz') : t('quiz')}
                        </CardTitle>
                        <CardDescription>
                            {isRequiz ? t('reQuizDescription') : t('quizDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={nextStep}>
                            {isRequiz ? t('retakeButton') : t('startButton')}
                        </Button>
                    </CardContent>
                </>
            ) : (
                <QuizContextProvider>
                    <CardContent>
                        <Quiz
                            articleTitle={articleTitle}
                            mcq={mcq}
                            articleId={articleId}
                            userId={userId}
                        />
                    </CardContent>
                </QuizContextProvider>
            )}
        </Card>
    )
}
interface QuizProps {
    mcq: Question[],
    articleId: string,
    userId: string,
    articleTitle: string,
}

function Quiz({
    mcq,
    articleId,
    userId,
    articleTitle,
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
        const descriptorId = mcq[currentQuestionIndex].descriptor_id;
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
            if (currentQuestionIndex === mcq.length - 1) {
                //pause timer
                setPaused(true);
                return toast({
                    title: t('toast.quizCompleted'),
                    description: t('toast.quizCompletedDescription'),
                })
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
                {mcq.map((question, index) => {
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
                    total: mcq.length,
                })}
            </CardTitle>
            <CardDescription className='text-2xl md:text-2xl mt-3'>
                {mcq[currentQuestionIndex].question}
            </CardDescription>
            <div className='flex flex-col'>
                {mcq[currentQuestionIndex].answers.map((answer, index) => {
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
            {mcq.length - 1 !== currentQuestionIndex ? (
                <Button className='mt-4' variant='outline' disabled={!isAnswered || loading} size='sm' onClick={onNextQuestion}>
                    {t('nextQuestionButton')}
                </Button>
            ) : (<RateDialog disabled={!isAnswered || loading} userId={userId} articleId={articleId} articleTitle={articleTitle} />)
            }
        </>
    )
}