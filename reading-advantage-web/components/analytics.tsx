"use client"

import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

export function Analytics() {
    const mode = process.env.NODE_ENV === "production" ? "production" : "development";
    return <VercelAnalytics mode={mode} />
}