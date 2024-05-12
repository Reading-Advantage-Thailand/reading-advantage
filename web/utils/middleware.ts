import { NextResponse, type NextRequest } from "next/server.js";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// Middleware to log requests
export const logRequest = (
    req: NextRequest,
    params: unknown,
    next: () => void
) => {
    console.log(`${req.method} ${req.url}`);
    return next();
};

// Middleware to protect routes
export interface ExtendedNextRequest extends NextRequest {
    session?: {
        user: {
            name: string;
            email: string;
            image: string;
            id: string;
            level: number;
            verified: boolean;
            xp: number;
            cefrLevel: string;
            role: string;
        };
    };
}
export const protect = async (
    req: ExtendedNextRequest,
    params: unknown,
    next: () => void
) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Send user session to the next middleware
    req.session = session;
    return next();
};
