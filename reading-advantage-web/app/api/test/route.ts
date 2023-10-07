import { NextResponse } from "next/server";

// test/route.ts
export async function GET(req: Request, res: Response) {

    const service_account = process.env.SERVICE_ACCOUNT_KEY;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

    const NEXT_PUBLIC_URL_BASE = process.env.NEXT_PUBLIC_URL_BASE;
    return new Response(JSON.stringify({
        message: "hello",
        service_account,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        NEXTAUTH_SECRET,
        NEXT_PUBLIC_URL_BASE,
    }), {
        headers: {
            "content-type": "application/json",
        },
    });
}