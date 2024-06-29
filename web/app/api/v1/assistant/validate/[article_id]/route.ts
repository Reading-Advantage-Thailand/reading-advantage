import { logRequest, protect } from "@/utils/middleware";
import validator from "@/utils/validator";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

interface RequestContext {
    params: {
        article_id: string;
    };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.post(async (
    req: NextRequest,
    context: RequestContext,
) => {
    try {
        const validate = await validator(context.params.article_id)
        return NextResponse.json({ validate }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 400 });
    }
});

export async function POST(request: NextRequest, ctx: RequestContext) {
    const result = await router.run(request, ctx);
    if (result instanceof NextResponse) {
        return result;
    }
    // Handle the case where result is not a NextResponse
    // You might want to return a default NextResponse or throw an error
    throw new Error("Expected a NextResponse from router.run");
}