import { restrictAccessKey } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { evaluateUserRunner } from "@/server/runners/evaluate-user-runner";
import { handleRequest } from "@/server/utils/handle-request";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";

export interface Context {
    params?: unknown;
}

const router = createEdgeRouter<NextRequest, Context>();

// Middleware
router.use(logRequest);
router.use(restrictAccessKey);

router.post(evaluateUserRunner);

export const POST = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);