'use client';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react'
import React from 'react'
import { buttonVariants } from './ui/button';

type Props = {}

export default function LogoutButton({ }: Props) {
    return (
        <div>
            <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() => {
                    signOut()
                }}>Logout</button>
        </div>
    )
}