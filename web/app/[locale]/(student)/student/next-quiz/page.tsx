import ArticleCard from '@/components/article-card'
import { Header } from '@/components/header'
import LevelSelect from '@/components/level-select'
import Select from '@/components/select'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {}
async function fetchTypes(
    level: number
) {
    const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/articles?level=${level}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    const data = await response.json();
    return data;
}

export default async function NextQuizPage({ }: Props) {
    const user = await getCurrentUser();
    if (!user) {
        return redirect('/login');
    }
    if (user.level === 0) {
        return redirect('/student/level');
    }
    const response = await fetchTypes(user.level);
    return (
        <>
            <Header
                heading='Article selection'
            />
            <Select
                types={response.data}
                user={{
                    level: user.level,
                    name: user.name,
                    id: user.id,
                }}
            />
        </>
    )
}