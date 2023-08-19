"use client";
import { SessionProvider } from "next-auth/react"
type Props = {
    children?: React.ReactNode;
    session: any;
};

export const NextAuthProvider = ({ children, session }: Props) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return <SessionProvider session={session} basePath={basePath}>
        {children}
    </ SessionProvider>;
};
