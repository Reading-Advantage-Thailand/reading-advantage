'use client';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { text } from '@constants/colors';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemText, Stack } from '@mui/material';
import formatDate from '@utils/formatDate';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';
import { count } from 'console';

function ArticleRecordPage() {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const [articles, setArticles] = useState([])
    const [isReread, setIsReread] = useState(false)
    const [lowRating, setLowRating] = useState([])
    const lowRatingArray = []
    let countRatingLowerThanThree = 0;
    useEffect(() => {
        getUserActivities()
    }, [])
    const getUserActivities = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/user/activities')
            console.log(res.data);
            setArticles(res.data.articles)
            countRatingLowerThanThree = res.data.articles.filter((article: any) => {
                return article.rating < 3
            }).length
            setLowRating(res.data.articles.filter((article: any) => {
                return article.rating < 3
            }))
            setOpen(countRatingLowerThanThree > 0 && res.data.articles.length >= 5)
            setIsReread(articles.length >= 5 && countRatingLowerThanThree > 0)
            // if (countRatingLowerThanThree >= 5) {
            //     window.alert('You have rated 5 articles lower than 3, please contact admin to get support')
            // }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <Container>
            <Typography variant='h5' fontWeight='bold' color={text}>
                User article records
            </Typography>
            {
                //map articles with index
                articles.map((article, index) => (
                    <Link href={`/home/article-records/${article.articleId}`} key={article.id} >
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
                                {article.title}
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
            {
                !loading && lowRating.length > 0 && articles.length >= 5 && (
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        // PaperComponent={PaperComponent}
                        aria-labelledby="draggable-dialog-title"
                    >
                        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                            You might want to try reading one of these articles again to see if you've improved.
                        </DialogTitle>
                        <DialogContent>
                            {
                                lowRating.map((article, index) => (
                                    <Link href={`/home/reread/${article.articleId}`} key={article.id} >
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
                                                {article.title}
                                            </Typography>
                                            <Typography color={text}>
                                                Your rating: {article.rating}
                                            </Typography>
                                        </Stack>

                                    </Link>
                                ))
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button autoFocus onClick={handleClose}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                )
            }

        </Container>
    );
}
export default ArticleRecordPage;
