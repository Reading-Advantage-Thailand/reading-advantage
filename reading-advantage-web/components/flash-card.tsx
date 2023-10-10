'use client'
import React, { useEffect, useState } from 'react'
import { FlashcardArray } from "react-quizlet-flashcard";
import axios from 'axios';
import AudioButton from './audio-button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Icons } from './icons';
import { Button } from './ui/button';
import { formatDate } from '@/lib/utils';
import { Header } from './header';
import { toast } from './ui/use-toast';

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
    const [sentences, setSentences] = useState<Sentence[]>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    useEffect(() => {
        getUserSentenceSaved()
    }, [])
    const getUserSentenceSaved = async () => {
        try {
            const res = await axios.get(`/api/users/${userId}/sentences`)
            console.log(res.data);
            setSentences(res.data.sentences)
        } catch (error) {
            console.log(error);
        }
    }
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
                title: "Success",
                description: `You have deleted the sentence`,
            });
        } catch (error) {
            console.log(error);
            toast({
                title: "Something went wrong.",
                description: "Your sentence was not deleted. Please try again.",
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
                heading="Flashcard"
                text='You can review your saved sentences here'
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
                        <AudioButton
                            audioUrl={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${sentences[currentCardIndex]?.articleId}.mp3`}
                            startTimestamp={sentences[currentCardIndex]?.timepoint}
                            endTimestamp={sentences[currentCardIndex]?.endTimepoint}
                        />
                    </>
                }
            </div>
            <Card className="col-span-3 mt-4 mb-10">
                <CardHeader>
                    <CardTitle>Saved Sentences</CardTitle>
                    <CardDescription>
                        {sentences.length == 0 ? 'You have no saved sentences' : `You have ${sentences.length} saved sentences`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {
                        sentences.length != 0 && sentences.map((sentence, index) => {
                            return (
                                <div className="-mx-4 flex items-center rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer gap-3">
                                    <Link href={`/student/next-quiz/${sentence.articleId}`} >
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{sentence.sentence}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Added {formatDate(sentence.createdAt)}
                                            </p>
                                        </div>
                                    </Link>
                                    <Button className="ml-auto font-medium" size='sm' variant='destructive' onClick={() => handleDelete(sentence.id)}>
                                        delete
                                    </Button>
                                </div>
                            )
                        })}
                </CardContent>
            </Card>
        </>
    )
}