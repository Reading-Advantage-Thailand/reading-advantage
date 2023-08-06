import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Create response
        const response = NextResponse.json({
            message: "User logged out",
            success: true,
        }, { status: 200 });

        // Clear the token cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            path: "/", // Set the appropriate path
            expires: new Date(0), // Expire the cookie immediately
        });

        return response;
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'An error occurred while processing your request.',
        }, { status: 500 });
    }
}
