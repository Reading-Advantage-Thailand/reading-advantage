'use client';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { text } from '@constants/colors';
import { Stack } from '@mui/material';
import formatDate from '@utils/formatDate';
import { useEffect, useState } from 'react';
import router from 'next/router';
import axios from 'axios';
import Link from 'next/link';


function HomePage() {

    const [articles, setArticles] = useState([])

    useEffect(() => {
        getUserActivities()
    }, [])
    const getUserActivities = async () => {
        try {
            const res = await axios.get('/api/user/activities')
            console.log(res.data);
            setArticles(res.data.articles)
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Container>
            <Typography variant='h5' fontWeight='bold' color={text}>
                User article records
            </Typography>
            {
                //map articles with index
                articles.map((article, index) => (
                    <Link href={`home/article/${article.articleId}`} key={article.id} >
                        <Stack key={index} sx={{
                            boxShadow: 3,
                            m: 1,
                            p: 1,
                            borderRadius: 1,
                            flexDirection: 'row',
                            gap: 1,
                        }}>
                            <Typography color={text}>
                                {index + 1}
                            </Typography>
                            <Typography color={text}>
                                {article.articleId}
                            </Typography>
                            <Typography color={text}>
                                {
                                    formatDate(article.createdAt)
                                }
                            </Typography>
                        </Stack>
                    </Link>
                ))
            }
        </Container>
    );
}
export default HomePage;
