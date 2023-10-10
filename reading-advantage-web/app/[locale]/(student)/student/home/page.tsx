import { ArticleRecordsTable } from '@/components/article-records-table'
import { Header } from '@/components/header'
import { ReminderRereadTable } from '@/components/reminder-reread-table'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import React from 'react'

type Props = {}

export const metadata = {
    title: "Student Home Page",
}

async function getUserArticleRecords(userId: string) {
    // fetch user article records
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/article-records`,
        {
            method: 'GET',
            headers: headers(),
        }
    );
    return res.json();
}
export default async function StudentHomePage({ }: Props) {
    // const t = useTranslations('pages.student.article-records')
    const user = await getCurrentUser();
    if (!user) {
        return redirect('/login');
    }
    if (user.level === 0) {
        return redirect('/level');
    }
    const res = await getUserArticleRecords(user.id);
    // articles that have been read
    // put the articles that have rating lower than 3 in the reminder table
    const reminderArticles = res.articles.filter((article: any) => article.rating < 3);
    // put the articles that have rating higher than 3 in the article records table
    const articleRecords = res.articles.filter((article: any) => article.rating >= 3);
    return (
        <>
            {
                reminderArticles.length !== 0 && (
                    <>
                        <Header
                            // heading={t('heading-reminder-reread')}
                            // text={t('text-reminder-reread')}
                            heading='Reminder to reread'
                            text="You might want to try reading one of these articles again to see if you've improved."
                            variant='warning'
                        />
                        <ReminderRereadTable
                            articles={reminderArticles}
                        />
                    </>
                )
            }
            <Header
                // heading={t('heading')}
                // text={t('text')}
                heading='Article records'
                text="History of articles you have read."
            />
            <ArticleRecordsTable
                articles={articleRecords}
            />
        </>

    )
}