import { protect } from "@/server/controllers/auth-controller";
import { getUserAllRecords } from "@/server/controllers/user-controller";
import { logRequest } from "@/server/middleware";
import { handleRequest } from "@/server/utils/handle-request";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

interface RequestContext {
    params: {
        id: string;
    };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getUserAllRecords);

export const GET = (request: NextRequest, ctx: RequestContext) => handleRequest(router, request, ctx);
