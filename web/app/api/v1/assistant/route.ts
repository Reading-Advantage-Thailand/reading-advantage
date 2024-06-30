import { generateQueue } from "@/controllers/assistant-controller";
import { logRequest, protect, restrictAccess } from "@/utils/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

const router = createEdgeRouter<NextRequest, { params?: unknown }>();

router.use(logRequest);
router.use(restrictAccess);
router.post(generateQueue);

export async function POST(request: NextRequest, ctx: { params?: unknown }): Promise<NextResponse> {
    const result = await router.run(request, ctx);
    if (result instanceof NextResponse) {
        return result;
    }
    // Handle the case where result is not a NextResponse
    // You might want to return a default NextResponse or throw an error
    throw new Error("Expected a NextResponse from router.run");
}