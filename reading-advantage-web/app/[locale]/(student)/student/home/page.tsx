import { getCurrentUser } from '@/lib/session'
import React from 'react'

type Props = {}

export default async function StudentHomePage({ }: Props) {
    const session = await getCurrentUser();

    return (
        <div className='mt-10'>{
            session?.name
        }</div>
    )
}