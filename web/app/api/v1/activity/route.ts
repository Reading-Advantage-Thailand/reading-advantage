import { getAllUserActivity } from "@/server/controllers/activity-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { type NextRequest } from "next/server";
import { handleRequest } from "@/server/utils/handle-request";

export interface Context {
    params?: unknown;
}

const router = createEdgeRouter<NextRequest, Context>();

router.use(logRequest);

//api/v1/activity
router.get(getAllUserActivity);

export const GET = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);
