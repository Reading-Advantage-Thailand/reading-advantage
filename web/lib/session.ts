import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/nextauth"

export async function getCurrentUser() {
    const session = await getServerSession(authOptions)

    return session?.user
}