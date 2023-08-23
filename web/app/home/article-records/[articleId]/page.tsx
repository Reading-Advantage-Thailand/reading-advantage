'use client';
import Loading from '@app/loading';
import { Button, Container } from '@mui/material'
import axios from 'axios'
import Link from 'next/link'
import React from 'react'
import useSWR from 'swr'

const ArticlePage = ({ params }: { params: { articleId: string } }) => {
    // Fetch data from API
    const { data, error } = useSWR(`/api/articles/${params.articleId}`, axios.get)
    if (error) return <div>failed to load</div>
    if (!data) return <Loading />

    // console.log(data.data.data.article);
    const result = data as any
    const article = result.data.data.article
    return (
        <Container>
            <p>RA level: {article.raLevel} </p>
            <p>Article ID: {params.articleId}</p>
            <p>Article Title: {article.title}</p>
            <p>type: {article.type}</p>
            <p>genre: {article.genre}</p>
            <p>sub genre: {article.subGenre}</p>
            <p>grade: {article.grade}</p>
            <img
                style={{
                    marginTop: "2rem",
                    //center
                }}
                src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${params.articleId}.png`}
                // src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${article.id}.png`}
                alt={`${article.id}.png`}
            />
            <p>Article Content: {article.content}</p>
            {/* Use the fetched data */}
            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        </Container>
    )
}

export default ArticlePage
