import React from 'react'

type Props = {
    children: React.ReactNode
}

export default function StudentHomeLayout({
    children
}: Props) {
    return (
        <div>
            StudentHomeLayout
            <div>
                {children}
            </div>
        </div>
    )
}