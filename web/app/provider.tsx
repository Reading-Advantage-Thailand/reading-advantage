"use client";
import { SessionProvider } from "next-auth/react";

type Props = {
    children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
};
