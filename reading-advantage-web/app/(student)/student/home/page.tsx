import { ArticleRecordsTable } from '@/components/article-records-table'
import { Header } from '@/components/header'
import React from 'react'

type Props = {}

export const metadata = {
    title: "Student Home Page",
}


export default function StudentHomePage({ }: Props) {
    return (
        <>
            <Header
                heading="Article Records"
                text="History of articles you have read."
            />
            <ArticleRecordsTable />
        </>

    )
}