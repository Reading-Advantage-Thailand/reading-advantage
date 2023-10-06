import LevelSelect from '@/components/level-select'
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {}

export const metadata = {
    title: "Level grading",
}
export default async function LevelPage({ }: Props) {
    const user = await getCurrentUser();
    if (!user) {
        return redirect('/login');
    }

    if (user.level > 0) {
        return redirect('/student/home',);
    }

    return <LevelSelect userId={user.id} />

}