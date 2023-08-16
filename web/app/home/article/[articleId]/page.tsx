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
            <h1>Article Page</h1>
            <p>RA level: {article.raLevel} </p>
            <p>Article ID: {params.articleId}</p>
            <p>Article Title: {article.title}</p>
            <p>Article Content: {article.content}</p>
            {/* Use the fetched data */}
            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        </Container>
    )
}

export default ArticlePage
