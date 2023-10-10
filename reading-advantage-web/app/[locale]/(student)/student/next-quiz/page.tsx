import { Header } from '@/components/header'
import Select from '@/components/select'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {}
async function getTypes(
    level: number
) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles?level=${level}`,
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
        return redirect('/level');
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