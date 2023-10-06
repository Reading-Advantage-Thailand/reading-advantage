"use client";
import { SessionProvider } from "next-auth/react"
type Props = {
    children?: React.ReactNode;
    session: any;
};

export const NextAuthSessionProvider = ({ children, session }: Props) => {
    const basePath = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    return <SessionProvider session={session} basePath={basePath}>
        {children}
    </ SessionProvider>;
};
