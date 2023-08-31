'use client';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { text } from '@constants/colors';
import { Box, Button, Stack } from '@mui/material';
import formatDate from '@utils/formatDate';
import { use, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FlashcardArray } from "react-quizlet-flashcard";
import React from 'react';
import AudioButton from '@components/audio';

function FlashcardPage() {
    const [sentences, setSentences] = useState([])

    useEffect(() => {
        getUserSentenceSaved()
    }, [])
    const getUserSentenceSaved = async () => {
        try {
            const res = await axios.get('/api/user/sentence-saved')
            console.log(res.data);
            setSentences(res.data.sentences)
        } catch (error) {
            console.log(error);
        }
    }
    const handleDelete = async (id: string) => {
        try {
            const res = await axios.delete(`/api/user/sentence-saved`, {
                data: {
                    sentenceId: id
                }
            })
            console.log(res.data);
            getUserSentenceSaved()
        } catch (error) {
            console.log(error);
        }
    }


    const cards = sentences.map((sentence, index) => {
        return {
            id: index,
            frontHTML: <div
                style={{
                    padding: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    //center
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    textAlign: 'center',
                    color: text
                }}>
                {sentence.sentence}
            </div>,
            backHTML: <div style={{
                padding: '1rem',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                //center
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                textAlign: 'center',
                color: text
            }}>
                {sentence.translation}
            </div>,
        }
    })


    //currentCardFlipRef
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    return (
        <Container>
            <Typography variant='h5' fontWeight='bold' color={text}>
                Flashcard
            </Typography>
            <Stack
                justifyItems={'center'}
                alignItems={'center'}
                mt='1rem'
            >
                {
                    sentences.length != 0 ?
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
                                startTime={sentences[currentCardIndex]?.timepoint}
                                endTime={sentences[currentCardIndex]?.endTimepoint}
                            />
                        </>
                        :
                        null
                }

            </Stack>
            {
                //map sentences with index
                sentences.length != 0 ? sentences.map((sentence, index) => (

                    <Box sx={{
                        boxShadow: 3,
                        m: 1,
                        p: 1,
                        borderRadius: 1,
                    }}
                        key={sentence.id}
                    >
                        <Link
                            style={{ textDecoration: 'none', color: text }}
                            href={`/home/article-records/${sentence.articleId}`} >
                            <Stack sx={{
                                flexDirection: 'row',
                                gap: 1,
                            }}>
                                <Typography color={text}
                                    sx={{
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {index + 1}
                                </Typography>
                                <Typography color={text}>
                                    {sentence.sentence}
                                </Typography>

                            </Stack>
                        </Link>
                        <Stack
                            sx={{
                                flexDirection: 'row',
                                gap: 1,
                                justifyContent: 'flex-end'
                            }}
                        >
                            {/* <Typography color={text}>
                                    {formatDate(sentence.createdAt)}
                                </Typography> */}
                            <Button
                                onClick={() => handleDelete(sentence.id)}
                            >
                                Delete
                            </Button>
                        </Stack>

                    </Box>
                )) :
                    <Typography color={text}>
                        You have no saved sentences
                    </Typography>
            }
        </Container>
    );
}
export default FlashcardPage;
