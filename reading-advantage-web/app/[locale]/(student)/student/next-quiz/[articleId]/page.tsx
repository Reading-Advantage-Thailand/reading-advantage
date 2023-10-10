import ArticleCard from '@/components/article-card';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import React from 'react'
import { headers } from 'next/headers';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Header } from '@/components/header';
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
async function getArticleRecords(
    userId: string,
    articleId: string
) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/article-records/${articleId}`,
        {
            method: 'GET',
            headers: headers(),
        }
    );
    const data = await response.json();
    console.log(data);
    return data;
}

export default async function ArticleQuizPage({ params }: { params: { articleId: string } }) {
    const user = await getCurrentUser();
    const res = await getArticle(params.articleId);
    if (!user) {
        return redirect('/login');
    }
    if (res.message === 'Article not found') {
        return <div>Article not found</div>
    }
    if (user.level === 0) {
        return redirect('/level');
    }
    const articleRecord = await getArticleRecords(user?.id, params.articleId);
    if (articleRecord.message === 'Record not found') {
        if (res.message === 'Insufficient level') {
            return <div>Insufficient level</div>
        }
        return <ArticleCard article={res.article} userId={user.id} articleId={params.articleId} />
    } else {
        if (res.message === 'Insufficient level') {
            return <div>Insufficient level</div>
        }
        const score = articleRecord.userArticleRecord.questions.map((question: { descriptorId: string, isCorrect: boolean }) => {
            return question.isCorrect ? 1 : 0;
        }).reduce((a: number, b: number) => a + b, 0);
        const scorePoints = score > 1 ? `${score} points` : `${score} point`;
        const timeSeconds = articleRecord.userArticleRecord.timeRecorded > 1 ? `${articleRecord.userArticleRecord.timeRecorded} seconds` : `${articleRecord.userArticleRecord.timeRecorded} second`;
        return (
            <>
                <Header
                    heading='You have read this before'
                    text='
                    You might try reading and practicing again to improve your reading skills. And this is the result of your previous reading.'
                />
                <div className="grid mt-3 gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{articleRecord.userArticleRecord.status}</div>
                            <p className="text-xs text-muted-foreground">
                                last updated {formatDate(articleRecord.userArticleRecord.updatedAt)}
                            </p>
                        </CardContent>
                    </Card>
                    {
                        articleRecord.userArticleRecord.status === 'completed' && (
                            <>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Score
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{scorePoints}</div>
                                        <p className="text-xs text-muted-foreground">
                                            of {articleRecord.userArticleRecord.questions.length} questions
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Rated</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{articleRecord.userArticleRecord.rating}</div>
                                        <p className="text-xs text-muted-foreground">
                                            You rated this article
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Time Spent
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{timeSeconds}</div>
                                        <p className="text-xs text-muted-foreground">
                                            answering of {articleRecord.userArticleRecord.questions.length} questions
                                        </p>
                                    </CardContent>
                                </Card>
                            </>)}
                </div>
                <ArticleCard isRequiz={articleRecord.userArticleRecord.status === 'completed'} article={res.article} userId={user.id} articleId={params.articleId} />
            </>
        )
    }

}