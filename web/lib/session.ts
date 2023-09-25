import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/auth";

// Get current session from the server
// This is used to get the current user in the server side
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
}