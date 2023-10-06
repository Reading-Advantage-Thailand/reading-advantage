"use client"

import { signIn } from 'next-auth/react'
import React from 'react'

type Props = {}

export default function LoginPage({ }: Props) {
    return (
        <button
            type="button"
            onClick={() => {
                signIn("google")
            }}
        >
            Google
        </button>
    )
}