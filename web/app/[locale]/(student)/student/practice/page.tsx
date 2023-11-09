import FlashCard from '@/components/flash-card';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {}

export default async function PracticePage({ }: Props) {
    const user = await getCurrentUser();
    if (!user) {
        return redirect('/login');
    }
    if (user.level === 0) {
        return redirect('/level');
    }
    return (
        <FlashCard userId={user.id} />
    )
}