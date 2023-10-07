import ArticleCard from '@/components/article-card';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import React from 'react'
import { headers } from 'next/headers';
import axios from 'axios';
type Props = {}

export const metadata = {
    title: "Article Quiz",
    description: "Article Quiz",
}

async function getArticle(
    articleId: string
) {
    const response = await axios.get(
        `/api/articles/${articleId}`,
    );
    const data = await response.data;
    return data;
}
export default async function ArticleQuizPage({ params }: { params: { articleId: string } }) {
    const user = await getCurrentUser();
    const res = await getArticle(params.articleId);
    if (!user) {
        return redirect('/login');
    }

    if (user.level === 0) {
        return redirect('/student/level');
    }

    if (res.message === 'Insufficient level') {
        return <div>Insufficient level</div>
    }

    if (res.message === 'Article not found') {
        return <div>Article not found</div>
    }

    return (
        <ArticleCard article={res.article} userId={user.id} articleId={params.articleId} />
    )
}