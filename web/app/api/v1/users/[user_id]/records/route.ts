import { getSAQuestion } from "@/controllers/question-controller";
import { getUserRecords } from "@/controllers/user-controller";
import { logRequest, protect } from "@/utils/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

interface RequestContext {
    params: {
        user_id: string;
    };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getUserRecords);

export async function GET(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}
