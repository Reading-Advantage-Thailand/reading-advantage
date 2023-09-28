'use client';
import { signOut } from 'next-auth/react'
import React from 'react'

type Props = {}

export default function LogoutButton({ }: Props) {
    return (
        <div>
            <button onClick={() => {
                signOut()
            }}>Logout</button>
        </div>
    )
}