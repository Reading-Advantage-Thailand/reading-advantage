import { restrictAccessKey } from "@/server/controllers/auth-controller";
import { validateArticle } from "@/server/controllers/validator-controller";
import { logRequest } from "@/server/middleware";
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

// POST /api/v1/articles/validate
// BODY: { runToday: boolean, filterByDate: string }
router.post(validateArticle);

export const POST = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);