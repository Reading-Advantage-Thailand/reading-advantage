'use client'
import React, { useEffect, useState } from 'react'
import { FlashcardArray } from "react-quizlet-flashcard";
import axios from 'axios';
import AudioButton from './audio-button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatDate } from '@/lib/utils';
import { Header } from './header';
import { toast } from './ui/use-toast';
import { useScopedI18n } from '@/locales/client';

type Props = {
    userId: string;
}
type Sentence = {
    articleId: string;
    createdAt: { _seconds: number; _nanoseconds: number; },
    endTimepoint: number;
    sentence: string;
    sn: number;
    timepoint: number;
    translation: string;
    userId: string;
    id: string;
}

export default function FlashCard({
    userId,
}: Props) {
    const t = useScopedI18n('pages.student.flashcardPage');
    const [sentences, setSentences] = useState<Sentence[]>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const getUserSentenceSaved = async () => {
        try {
            const res = await axios.get(`/api/users/${userId}/sentences`)
            console.log(res.data);
            setSentences(res.data.sentences)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getUserSentenceSaved();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const res = await axios.delete(`/api/users/${userId}/sentences`, {
                data: {
                    sentenceId: id
                }
            })
            console.log(res.data);
            getUserSentenceSaved()
            toast({
                title: t('toast.success'),
                description: t('toast.successDescription')
            });
        } catch (error) {
            console.log(error);
            toast({
                title: t('toast.error'),
                description: t('toast.errorDescription'),
                variant: "destructive",
            });
        }
    }

    const cards = sentences.map((sentence, index) => {
        return {
            id: index,
            frontHTML: <div className='flex p-4 text-2xl font-bold text-center justify-center items-center h-full dark:bg-accent dark:rounded-lg dark:text-muted-foreground'>{sentence.sentence}</div>,
            backHTML: <div className='flex p-4 text-2xl font-bold text-center justify-center items-center h-full dark:bg-accent dark:rounded-lg dark:text-muted-foreground'>{sentence.translation}</div>,
        }
    })

    return (
        <>
            <Header
                heading={t('flashcard')}
                text={t('flashcardDescription')}
            />
            <div className="flex flex-col items-center justify-center space-y-2 mt-4">
                {
                    sentences.length != 0 &&
                    <>
                        <FlashcardArray
                            cards={cards}
                            onCardChange={(index) => {
                                console.log(index);
                                setCurrentCardIndex(index)
                            }}
                        />
                        {sentences.map((sentence, index) => {
                            if (index === currentCardIndex) {
                                return (
                                    <AudioButton
                                        key={sentence.id}
                                        audioUrl={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${sentence.articleId}.mp3`}
                                        startTimestamp={sentence.timepoint}
                                        endTimestamp={sentence.endTimepoint}
                                    />
                                )
                            }
                        })}
                    </>
                }
            </div>
            <Card className="col-span-3 mt-4 mb-10">
                <CardHeader>
                    <CardTitle>{t('savedSentences')}</CardTitle>
                    <CardDescription>
                        {sentences.length == 0 ?
                            t('noSavedSentences')
                            : t('savedSentencesDescription', {
                                total: sentences.length,
                            })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {
                        sentences.length != 0 && sentences.map((sentence, index) => {
                            return (
                                <div key={sentence.id} className="-mx-4 flex items-center rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer gap-3">
                                    <Link href={`/student/next-quiz/${sentence.articleId}`} >
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{sentence.sentence}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {t('added', {
                                                    date: formatDate(sentence.createdAt)
                                                })}
                                            </p>
                                        </div>
                                    </Link>
                                    <Button className="ml-auto font-medium" size='sm' variant='destructive' onClick={() => handleDelete(sentence.id)}>
                                        {t('deleteButton')}
                                    </Button>

                                </div>
                            )
                        })}
                </CardContent>
            </Card>
        </>
    )
}