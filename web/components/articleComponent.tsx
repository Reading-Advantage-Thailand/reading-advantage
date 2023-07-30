'use client';
import * as React from 'react';
import { Box, Rating, Stack, Typography } from '@mui/material';
import { Article } from '@models/articleModel';

interface ArticleComponentProps {
    article: Article,
    currentLevel: number,
}

const ArticleComponent: React.FC<ArticleComponentProps> = ({
    article,
    currentLevel,
}) => {
    const [rating, setRating] = React.useState<number>(-1);
    const details = [
        {
            'title': 'RA Level',
            'value': article.raLevel
        },
        {
            'title': 'CEFR Level',
            'value': article.cefrLevel
        },
        {
            'title': 'ARI',
            'value': article.ari
        },
        {
            'title': 'Grade',
            'value': article.grade
        },
        {
            'title': 'Genre',
            'value': article.genre
        },
        {
            'title': 'Sub-Genre',
            'value': article.subGenre
        },
        {
            'title': 'Type',
            'value': article.type
        },
    ];
    return (
        <Box>

            <Typography
                color='#36343e'
                variant='h6'
                fontWeight='bold'
                pt='1rem'
            >
                {article.title}
            </Typography>
            <Typography
                color='#9995a9'
            >
                {article.content}
            </Typography>
            <Stack direction='row' flexWrap='wrap' gap='7px' mt='1rem'>
                {
                    details.map((detail, index) => (
                        <Typography
                            key={index}
                            bgcolor='lightgreen'
                            px='12px'
                            fontSize='12px'
                            fontWeight='bold'
                            textAlign='center'
                            borderRadius='5px'
                            color='#FFFFFF'
                        >
                            {detail.title}: {detail.value}
                        </Typography>
                    ))
                }
            </Stack>
            <Typography
                color='#36343e'
                variant='h6'
                fontWeight='bold'
                pt='1rem'
            >
                How easy is this article?
            </Typography>
            <Rating
                name="simple-controlled"
                value={rating}
                onChange={(event, newValue) => {
                    setRating(newValue ? newValue : 0);
                }}
            />
            {
                rating !== -1 ? (
                    <Typography
                        color='#9995a9'
                    >
                        Your new level for next time is {currentLevel + rating - 3}.
                    </Typography>
                ) : null
            }
        </Box>
    );
};

export default ArticleComponent;


