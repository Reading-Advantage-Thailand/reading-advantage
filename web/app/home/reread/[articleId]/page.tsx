"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import {
    Button,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Typography,
    makeStyles,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { Article } from "@models/articleModel";
import ArticleComponent from "@components/articleComponent";
import SliderComponent from "@components/sliderComponent";
import SelectItemComponent from "@components/selectItemComponent";
import { useRouter } from "next/navigation";
import DefaultLayout from "@components/DefaultLayout";
import { getSession, useSession } from 'next-auth/react'

const steps: string[] = ["Level", "Type", "Genre", "Sub-Genre", "Article"];

type Props = {
    params: {
        articleId: string;
    };
}

export default function HomePage(
    {
        params: {
            articleId
        },
    }: Props
): JSX.Element {
    const router = useRouter();
    const { data: session, status, update } = useSession();

    const [value, setValue] = useState<number | number[]>(session.level);

    const [article, setArticle] = useState<Article | null>(null);

    const [rating, setRating] = React.useState<number>(-1);

    const [errorMsg, setErrorMsg] = useState<string>("");

    // update user level
    const updateUserLevel = async () => {
        const updateUserLevelUrl = `/api/user/record-articles`;
        try {
            const res = await axios.put(updateUserLevelUrl, {
                articleId: article.id,
                newLevel: (value as number) + rating - 3,
                rating,
                // rating: (value as number) + rating - 3,
            });
            await update({
                level: (value as number) + rating - 3,
            });
            router.refresh();
            router.push('/home/article-records');
        } catch (error) {
            console.log(error);
        }
    };

    const getArticle = async () => {
        console.log(articleId);
        const getArticleUrl = `/api/articles/${articleId}`;
        try {
            const res = await axios.get(getArticleUrl);
            const fetchedArticle = res.data?.data.article || null;
            setArticle(fetchedArticle);
            console.log(article);
        } catch (error) {
            console.log(error);
        }
    };
    const handleNext = () => {

        updateUserLevel();
    };
    useEffect(() => {
        getArticle();
    }, []);


    return (
        <DefaultLayout>
            <Box sx={{
                pt: {
                    xs: 6,
                    sm: 8
                }
            }}>
                <Typography variant="h3" fontWeight="bold" color="#36343e">
                    Re Read
                </Typography>
                {
                    article && (
                        <ArticleComponent
                            article={article as Article}
                            currentLevel={value as number}
                            rating={rating}
                            setRating={setRating}
                        />
                    )
                }
                <Stack direction="row" justifyContent="space-between" mt="3rem">
                    <Button
                        disabled={
                            (rating === -1)
                        }
                        variant="contained"
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </Stack>
                <Typography color="error">{errorMsg}</Typography>
            </Box>
        </DefaultLayout>
    );
}
