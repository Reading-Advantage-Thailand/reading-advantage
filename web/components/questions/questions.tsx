'use client'
import React, { useState } from 'react'
import MCQ from './mcq';
import QuestionHeader from './question-header';
import axios from 'axios';
import { toast } from '../ui/use-toast';
import { QuestionsType } from '@/types';
import { RecordStatus } from '@/types/constants';
import ShortAnswer from './short-answer';

type Props = {
    questions: QuestionsType,
    articleId: string,
    userId: string,
    articleTitle: string, // use for update user article record 
    className?: string,
}

export default function Questions({
    questions,
    articleId,
    userId,
    articleTitle,
    className,
}: Props) {
    const [isCompletedMCQ, setIsCompletedMCQ] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    async function onQuizCompleted() {
        try {
            // update user article record
            setLoading(true);
            const res = await axios.patch(`/api/users/${userId}/article-records/${articleId}`, {
                articleTitle,
            });
            setIsCompletedMCQ(true);
            toast({
                title: 'Quiz completed',
                description: 'You can now write the short answer question',
            })
        } catch (error) {
            toast({
                title: 'Something went wrong',
                description: 'Please try again later',
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={className}>
            <QuestionHeader
                heading='Multiple Choice Questions'
                description='Take the quiz to check your understanding'
                buttonLabel='Start Quiz'
                disabled={isCompletedMCQ}
            >
                <MCQ
                    loadingUpdateUserArticleRecord={loading}
                    isQuizCompleted={isCompletedMCQ}
                    articleTitle={articleTitle}
                    articleId={articleId}
                    mcqs={questions.mcqs}
                    userId={userId}
                    onQuizCompleted={onQuizCompleted}
                />
            </QuestionHeader>
            <QuestionHeader
                className='mt-3'
                heading='Short Answer Question'
                description='The short answer question is unlocked after you complete the quiz.'
                buttonLabel='Start Writing'
                disabled={!isCompletedMCQ}
            >
                <ShortAnswer
                    className='mt-3'
                    articleId={articleId}
                    userId={userId}
                    shortAnswer={questions.shortAnswer}
                />
            </QuestionHeader>
        </div>
    )
}