import { Header } from '@/components/header'
import Select from '@/components/select'
import { getCurrentUser } from '@/lib/session'
import { getScopedI18n } from '@/locales/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { Footer } from '@/components/footer'    

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

export default async function ReadPage({ }: Props) {
    const user = await getCurrentUser();
    if (!user) {
        return redirect('/login');
    }
    if (user.level === 0) {
        return redirect('/level');
    }
    const response = await getTypes(user.level);
    const t = await getScopedI18n('pages.student.readPage');
    return (
        <>
            <Header
                heading={t('articleSelection')}
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