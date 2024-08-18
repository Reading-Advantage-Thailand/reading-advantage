import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "../models/enum";
import { sendDiscordWebhook } from "../utils/send-discord-webhook";

// Middleware to protect routes
export interface ExtendedNextRequest extends NextRequest {
    session?: {
        user: User;
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
        return NextResponse.json({ message: "Unauthorized - Please login to access this resource" }, { status: 403 });
    }

    // if (session.user.expired) {
    //     return NextResponse.json({ message: "Unauthorized - Your account has expired" }, { status: 403 });
    // }

    // Send user session to the next middleware
    req.session = session;
    return next();
};

// Middleware to restrict access to specific roles
// If using the restrictTo, skip the protect middleware
export const restrictTo = (...allowedRoles: Role[]) => {
    return async (
        req: ExtendedNextRequest,
        params: unknown,
        next: () => void
    ) => {
        const session = await getServerSession(authOptions);
        console.log('restrictTo -> session', session);
        // Check if session exists
        if (!session) {
            return NextResponse.json({ message: "Unauthorized - Please login to access this resource" }, { status: 403 });
        }

        const { role } = session.user;

        // Check if the user role is allowed
        if (!allowedRoles.includes(role as Role)) {
            return NextResponse.json({ message: "Forbidden - You are not allowed to access this resource" }, { status: 403 });
        }

        // Check expired user
        // if (session.user.expired) {
        //     return NextResponse.json({ message: "Unauthorized - Your account has expired" }, { status: 403 });
        // }

        req.session = session;
        return next();
    };
};

// Restrict access (requires access key) to a route
export const restrictAccessKey = async (
    req: NextRequest,
    params: unknown,
    next: () => void
) => {
    const { headers } = req;
    const accessKey = headers.get("Access-Key");
    if (accessKey !== process.env.ACCESS_KEY) {
        const userAgent = req.headers.get('user-agent') || '';
        const url = req.url;

        await sendDiscordWebhook({
            title: 'Unauthorized: Access key is required',
            embeds: [
                {
                    description: {
                        status: 'Unauthorized',
                        'triggered at': new Date().toISOString(),
                        'user-agent': userAgent,
                        url,
                    },
                    color: 880808,
                },
                {
                    description: {
                        'Error Details': 'Unauthorized: reading advantage access key is required',
                    },
                    color: 16711680,
                },
            ],
            reqUrl: url,
            userAgent,
        });

        return NextResponse.json({
            message: "Unauthorized: Access key is required",
        }, { status: 403 });
    }
    return next();
}

export const isUserExpired = async (
    req: NextRequest,
    params: unknown,
    next: () => void
) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized - Please login to access this resource" }, { status: 403 });
    }

    const { user } = session;
    if (user.expired) {
        return NextResponse.json({ message: "Unauthorized - Your account has expired" }, { status: 403 });
    }

    return next();
}