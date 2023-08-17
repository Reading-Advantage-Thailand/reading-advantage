import { NextRequest, NextResponse } from "next/server";

// check env 
export async function GET(req: NextRequest) {
    console.log("NEXTAUTH_URL", process.env.NEXTAUTH_URL);
    console.log("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET);
    console.log('API_KEY', process.env.API_KEY);
    console.log('JWT_SECRET', process.env.JWT_SECRET);
    return NextResponse.json({
        message: "Env checked",
        success: true,
        data: {
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
            API_KEY: process.env.API_KEY,
            JWT_SECRET: process.env.JWT_SECRET,
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
            SERVICE_ACCOUNT_KEY: process.env.SERVICE_ACCOUNT_KEY,
        }
    });
}