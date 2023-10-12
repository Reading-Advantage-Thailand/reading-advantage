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
import { getScopedI18n } from '@/locales/server';
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
    return data;
}

export default async function ArticleQuizPage({ params }: { params: { articleId: string } }) {
    const t = await getScopedI18n('pages.student.nextQuizPage.article');
    const user = await getCurrentUser();
    const res = await getArticle(params.articleId);
    if (!user) {
        return redirect('/login');
    }
    if (res.message === 'Article not found') {
        return <div>{t('articleNotFound')}</div>
    }
    if (user.level === 0) {
        return redirect('/level');
    }
    const articleRecord = await getArticleRecords(user?.id, params.articleId);
    if (articleRecord.message === 'Record not found') {
        if (res.message === 'Insufficient level') {
            return <div>{t('articleInsufficientLevel')}</div>
        }
        return <ArticleCard article={res.article} userId={user.id} articleId={params.articleId} />
    } else {
        if (res.message === 'Insufficient level') {
            return <div>{t('articleInsufficientLevel')}</div>
        }
        const score = articleRecord.userArticleRecord.questions.map((question: { descriptorId: string, isCorrect: boolean }) => {
            return question.isCorrect ? 1 : 0;
        }).reduce((a: number, b: number) => a + b, 0);
        const scorePoints = score > 1 ? `${score} ${t('scoreSuffix.points')}` : `${score} ${t('scoreSuffix.point')}`;
        const timeSeconds = articleRecord.userArticleRecord.timeRecorded > 1 ? `${articleRecord.userArticleRecord.timeRecorded} ${t('secondSuffix.seconds')}` : `${articleRecord.userArticleRecord.timeRecorded} ${t('secondSuffix.second')}`;
        return (
            <>
                <Header
                    heading={t('readBefore')}
                    text={t('readBeforeDescription')}
                />
                <div className="grid mt-3 gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('status')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{
                                articleRecord.userArticleRecord.status === 'completed' ? t('statusText.completed') : t('statusText.uncompleted')
                            }</div>
                            <p className="text-xs text-muted-foreground">
                                {t('statusDescription', {
                                    date: formatDate(articleRecord.userArticleRecord.updatedAt),
                                })}
                            </p>
                        </CardContent>
                    </Card>
                    {
                        articleRecord.userArticleRecord.status === 'completed' && (
                            <>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('score')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {t('scoreText', {
                                                score: scorePoints
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('scoreDescription', {
                                                total: articleRecord.userArticleRecord.questions.length
                                            })}
                                        </p>
                                        {articleRecord.userArticleRecord.questions.map((question: { descriptorId: string, isCorrect: boolean, timeLogged: number }, index: number) => {
                                            return (
                                                <p key={question.descriptorId} className="text-xs text-muted-foreground">
                                                    Choice 1: {articleRecord.userArticleRecord.questions[index].isCorrect ? 'Correct' : 'Incorrect'} (finish at {articleRecord.userArticleRecord.questions[index].timeLogged} s.)
                                                </p>
                                            )
                                        })}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{t('rated')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {t('ratedText', {
                                                rated: articleRecord.userArticleRecord.rating
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('ratedDescription')}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {t('timeSpend')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {t('timeSpendText', {
                                                time: timeSeconds
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('timeSpendDescription', {
                                                total: articleRecord.userArticleRecord.questions.length
                                            })}
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