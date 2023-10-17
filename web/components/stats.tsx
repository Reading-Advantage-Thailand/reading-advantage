import { getScopedI18n } from '@/locales/server';
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatDate } from '@/lib/utils';
import { Header } from './header';
import { UserArticleRecordType } from '@/types';

type StatsProps = {
    articleRecord: UserArticleRecordType,
}

export default async function Stats({
    articleRecord,
}: StatsProps) {
    const t = await getScopedI18n('pages.student.nextQuizPage.article');

    // Calculate score
    const score = articleRecord.questions.map((question: { descriptorId: string, isCorrect: boolean }) => {
        return question.isCorrect ? 1 : 0;
    }).reduce((a: number, b: number) => a + b, 0);
    const scorePoints = score > 1 ? `${score} ${t('scoreSuffix.points')}` : `${score} ${t('scoreSuffix.point')}`;
    const timeSeconds = articleRecord.timeRecorded > 1 ? `${articleRecord.timeRecorded} ${t('secondSuffix.seconds')}` : `${articleRecord.timeRecorded} ${t('secondSuffix.second')}`;

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
                        <div className="text-xl font-bold">{articleRecord.status}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('statusDescription', {
                                date: formatDate(articleRecord.updatedAt),
                            })}
                        </p>
                    </CardContent>
                </Card>
                {
                    articleRecord.status === 'completed' && (
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
                                            total: articleRecord.questions.length
                                        })}
                                    </p>
                                    {/* {articleRecord.questions.map((question: { descriptorId: string, isCorrect: boolean, timeLogged: number }, index: number) => {
                                        return (
                                            <p key={question.descriptorId} className="text-xs text-muted-foreground">
                                                Choice {index + 1}: {articleRecord.questions[index].isCorrect ? 'Correct' : 'Incorrect'} (finish at {articleRecord.questions[index].timeLogged} s.)
                                            </p>
                                        )
                                    })} */}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t('rated')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {t('ratedText', {
                                            rated: articleRecord.rating
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
                                            total: articleRecord.questions.length
                                        })}
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    )}
            </div>
        </>
    )
}