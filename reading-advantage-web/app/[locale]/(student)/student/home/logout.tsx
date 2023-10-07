'use client'
import { signOut } from 'next-auth/react'
import React from 'react'

type Props = {}

export default function ButtonLogout({ }: Props) {
    return (
        <button
            onClick={() => {
                signOut()
            }}
        >
            logout
        </button>
    )
}