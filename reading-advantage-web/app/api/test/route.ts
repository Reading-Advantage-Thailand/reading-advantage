import { NextResponse } from "next/server";

// test/route.ts
export async function GET(req: Request, res: Response) {

    const service_account = process.env.SERVICE_ACCOUNT_KEY;
    return new Response(JSON.stringify({
        message: "hello",
        service_account,
    }), {
        headers: {
            "content-type": "application/json",
        },
    });
}