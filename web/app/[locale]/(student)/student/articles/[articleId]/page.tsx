import ArticleCard from '@/components/article-card';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import React from 'react'
import { headers } from 'next/headers';
type Props = {}

export const metadata = {
    title: "Article Quiz",
    description: "Article Quiz",
}

async function getArticle(
    articleId: string
) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${articleId}`,
        {
            method: 'GET',
            headers: headers(),
        }
    );
    const data = await response.json();
    return data;
}

export default async function ArticleQuizPage({ params }: { params: { articleId: string } }) {
    const user = await getCurrentUser();
    const res = await getArticle(params.articleId);
    if (!user) {
        return redirect('/login');
    }

    if (user.level === 0) {
        return redirect('/level');
    }

    if (res.message === 'Insufficient level') {
        return <div>Insufficient level</div>
    }

    if (res.message === 'Article not found') {
        return <div>Article not found</div>
    }

    return (
        <div>Article Quiz Page</div>
        // <ArticleCard isRequiz={false} article={res.article} userId={user.id} articleId={params.articleId} />
    )
}