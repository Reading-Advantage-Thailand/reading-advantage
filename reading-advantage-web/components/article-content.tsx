'use client'
import React from 'react'
import Tokenizer from "sentence-tokenizer";
import { cn } from '@/lib/utils';
import axios, { AxiosError } from "axios";
import { toast } from './ui/use-toast';

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Badge } from './ui/badge';
import { Icons } from './icons';
import { useScopedI18n } from '@/locales/client';

interface ITextAudio {
    text: string;
    begin?: number;
}

export interface Article {
    id: string;
    ari: number;
    cefrLevel: string;
    cefrScores: {
        A1: number;
        A2: number;
        B1: number;
        B2: number;
        C1: number;
        C2: number;
    };
    content: string;
    genre: string;
    grade: number;
    raLevel: number;
    subGenre: string;
    title: string;
    topic: string;
    type: string;
    timepoints: [
        {
            timeSeconds: number;
            markName: string;
        }
    ];
    questions: {
        multiple_choice_questions: [
            {
                question: string;
                id: string;
                answers: {
                    choice_a: string;
                    choice_b: string;
                    choice_c: string;
                    choice_d: string;
                };
            }
        ];
    }
}
type Props = {
    article: Article,
    className?: string,
    articleId: string,
    userId: string,
}
export default function ArticleContent({
    article,
    articleId,
    userId,
    className,
}: Props) {
    const t = useScopedI18n('components.articleContent');
    //const [rating, setRating] = React.useState<number>(-1);
    const [text, setText] = React.useState<ITextAudio[]>([]);
    const [highlightedWordIndex, setHighlightedWordIndex] = React.useState(-1);
    const [isplaying, setIsPlaying] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const textContainer = React.useRef<HTMLParagraphElement | null>(null);
    const [isSplit, setIsSplit] = React.useState(false);
    const [selectedSentence, setSelectedSentence] = React.useState<Number>(-1);

    React.useEffect(() => {
        if (!isSplit) {
            splitToText(article);
            setIsSplit(true);
        }
    }, [article, isSplit]);

    const handleHighlight = (audioCurrentTime: number) => {
        const lastIndex = text.length - 1;

        if (audioCurrentTime >= text[lastIndex].begin!) {
            setHighlightedWordIndex(lastIndex);
        } else {
            const index = text.findIndex((word) => word.begin! >= audioCurrentTime);
            setHighlightedWordIndex(index - 1);
        }

        if (textContainer.current && highlightedWordIndex !== -1) {
            const highlightedWordElement = textContainer.current.children[
                highlightedWordIndex
            ] as HTMLElement;
            if (highlightedWordElement) {
                highlightedWordElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    };

    const handlePause = () => {
        setIsPlaying(!isplaying);
        if (audioRef.current === null) return;
        if (isplaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const splitToText = (article: Article) => {
        const tokenizer = new Tokenizer("Chuck");
        tokenizer.setEntry(article.content);
        const result = tokenizer.getSentences();

        // Clear the existing content in the 'text' array
        setText([]);

        for (let i = 0; i < article.timepoints.length; i++) {
            setText((prev) => [
                ...prev,
                { text: result[i], begin: article.timepoints[i].timeSeconds },
            ]);
        }
    };

    const handleSkipToSentence = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const saveToFlashcard = async () => {
        try {
            let endTimepoint = 0;
            if (selectedSentence !== text.length - 1) {
                endTimepoint = text[selectedSentence as number + 1].begin as number;
            } else {
                endTimepoint = audioRef.current?.duration as number;
            }
            const res = await axios.post(`/api/users/${userId}/sentences`, {
                sentence: text[selectedSentence as number].text,
                sn: selectedSentence,
                articleId: articleId,
                translation: "translation",
                timepoint: text[selectedSentence as number].begin,
                endTimepoint: endTimepoint,
            });
            console.log('res', res);
            toast({
                title: "Success",
                description: `You have saved "${text[selectedSentence as number].text}" to flashcard`,
            });

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data.message === 'Sentence already saved') {
                    toast({
                        title: 'Sentence already saved',
                        description: 'You have already saved this sentence.',
                        variant: "destructive",
                    })
                }
            } else {
                toast({
                    title: "Something went wrong.",
                    description: "Your sentence was not saved. Please try again.",
                    variant: "destructive",
                });
            }
        }
    }

    return (
        <>
            <div className='inline-flex gap-3'>
                <p>{t('voiceAssistant')}</p>
                <Badge>
                    {
                        isplaying ? (
                            <Icons.pause className='mr-1' size={12} />
                        ) : (
                            <Icons.play className='mr-1' size={12} />
                        )
                    }
                    <button onClick={handlePause}>{isplaying ? t('soundButton.pause') : t('soundButton.play')}</button>
                </Badge>
            </div>
            <ContextMenu >
                <ContextMenuTrigger>
                    {text.map((sentence, index) => (
                        <p
                            key={index}
                            className={cn(
                                "inline text-muted-foreground hover:bg-blue-200 dark:hover:bg-blue-600 select-none cursor-pointer",
                                highlightedWordIndex === index ? "bg-yellow-50" : "bg-transparent",
                            )}
                            onMouseEnter={() => {
                                setSelectedSentence(index);
                            }}
                            onClick={() => handleSkipToSentence(sentence.begin ?? 0)}
                        >
                            {sentence.text}{" "}
                        </p>
                    ))}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    <ContextMenuItem inset
                        onClick={() => {
                            saveToFlashcard();
                        }}
                    >
                        Save to flashcard
                    </ContextMenuItem>
                    <ContextMenuItem inset disabled>
                        Translate
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <audio
                ref={audioRef}
                onTimeUpdate={() => handleHighlight(
                    audioRef.current ? audioRef.current.currentTime : 0
                )}
            >
                <source
                    src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${articleId}.mp3`}
                />
            </audio>
        </>

    )
}