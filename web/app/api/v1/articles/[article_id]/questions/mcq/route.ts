import { getMCQuestions, retakeMCQuestion } from "@/controllers/question-controller";
import { logRequest, protect } from "@/utils/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

interface RequestContext {
    params: {
        article_id: string;
    };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getMCQuestions);
router.delete(retakeMCQuestion);

export async function GET(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}
export async function POST(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}
export async function DELETE(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}