import LevelSelect from '@/components/level-select'
import { NextAuthSessionProvider } from '@/components/providers/nextauth-session-provider';
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
        return redirect('/auth/signin');
    }
    if (user.level > 0) {
        return redirect('/student/read',);
    }

    return (
        <NextAuthSessionProvider session={user}>
            <LevelSelect userId={user.id} />
        </NextAuthSessionProvider>
    )
}