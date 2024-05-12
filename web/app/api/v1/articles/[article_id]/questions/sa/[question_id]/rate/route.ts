import { answerMCQuestion, answerSAQuestion, rateArticle, } from "@/controllers/question-controller";
import { logRequest, protect } from "@/utils/middleware";
import { createEdgeRouter } from "next-connect";
import { type NextRequest } from "next/server";

interface RequestContext {
    params: {
        question_id: string;
        article_id: string;
    };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.post(rateArticle);

export async function POST(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}