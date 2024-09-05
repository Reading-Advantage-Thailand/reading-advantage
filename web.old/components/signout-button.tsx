'use client'
import { signOut } from 'next-auth/react'
import React from 'react'

type Props = {}

export default function SignOutButton({ }: Props) {
    return (
        <button
            onClick={() => {
                signOut({
                    callbackUrl: `${window.location.origin}/auth/signin`,
                })
            }}
        >
            Logout
        </button>
    )
}