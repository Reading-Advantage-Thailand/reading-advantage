import { getCurrentUser } from '@/lib/session'
import { signOut } from 'next-auth/react';
import React from 'react'
import ButtonLogout from './logout';
import axios from 'axios';

type Props = {}

export default async function StudentHomePage({ }: Props) {
    const session = await getCurrentUser();
    return (
        <>
            <div className='mt-10'>
                {session?.name}
            </div>
            <ButtonLogout />
        </>

    )
}