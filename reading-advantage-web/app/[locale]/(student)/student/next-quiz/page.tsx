import ArticleCard from '@/components/article-card'
import { Header } from '@/components/header'
import LevelSelect from '@/components/level-select'
import Select from '@/components/select'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import React from 'react'
import axios from 'axios'

type Props = {}
async function getTypes(
    level: number
) {
    const response = await axios.get(
        `/api/articles?level=${level}`,
    );
    const data = await response.data;
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
    const response = await getTypes(user.level);
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