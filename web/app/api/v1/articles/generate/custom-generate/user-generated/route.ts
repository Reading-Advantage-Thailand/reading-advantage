import { approveUserArticle } from "@/server/controllers/generator-controller";
import { getUserGeneratedArticles } from "@/server/controllers/generator-controller";
import { protect } from "@/server/controllers/auth-controller";
import { generateUserArticle } from "@/server/controllers/generator-controller";
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
router.use(protect);

router.get(getUserGeneratedArticles);
router.post(approveUserArticle);

export const GET = (request: NextRequest, ctx: Context) =>
  handleRequest(router, request, ctx);

export const POST = (request: NextRequest, ctx: Context) =>
  handleRequest(router, request, ctx);
