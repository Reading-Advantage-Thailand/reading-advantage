import Link from 'next/link'

import React from 'react'
type Props = {
    children: React.ReactNode
}

export default function IndexLayout({
    children
}: Props) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="container z-40 bg-background">
                <div className="flex h-20 items-center justify-between py-6">
                    <nav>
                        <Link
                            href="/login"
                        >
                            Login
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    )
}