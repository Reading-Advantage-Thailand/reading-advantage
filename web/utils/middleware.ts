import { NextResponse, type NextRequest } from "next/server.js";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import axios from "axios";
import { Status } from "./send-discord-webhook";

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
export const restrictAccess = async (
    req: NextRequest,
    params: unknown,
    next: () => void
) => {
    const { headers } = req;
    const accessKey = headers.get("Access-Key");
    if (accessKey !== process.env.ACCESS_KEY) {

        const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
        const userAgent = req.headers.get('user-agent') || '';
        const url = req.url;

        const payload = {
            embeds: [
                {
                    title: `Details (${process.env.NODE_ENV} mode)`,
                    description: `**status**: ${Status.ERROR} \n**triggered at**: <t:${Math.floor(Date.now() / 1000)}:R> \n**user-agent**: ${userAgent} \n**url**: ${url}\n`,
                    color: 880808,
                },
                {
                    title: 'Error Details',
                    description: 'Unauthorized: reading advantage access key is required',
                    color: 16711680,
                },
            ],
        };

        await axios.post(webhookUrl, payload);

        return NextResponse.json({
            message: "Unauthorized: Access key is required",
        }, { status: 403 });
    }
    return next();
}
