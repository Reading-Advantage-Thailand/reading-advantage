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

// Middleware to protect routes
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

// Restrict access (requires access key) to a route
export const restrictAccess = (
    req: NextRequest,
    params: unknown,
    next: () => void
) => {
    const { headers } = req;
    const accessKey = headers.get("Access-Key");
    if (accessKey !== process.env.ACCESS_KEY) {
        return NextResponse.json({
            message: "Unauthorized: Access key is required",
        }, { status: 403 });
    }
    return next();
}
