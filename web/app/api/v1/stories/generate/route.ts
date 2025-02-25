import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { logRequest } from "@/server/middleware";
import { handleRequest } from "@/server/utils/handle-request";
import { generateStories } from "@/server/utils/generators/stories-generator";

export interface Context {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, Context>();

// Middleware
router.use(logRequest);
//router.use(restrictAccessKey);

// POST /api/v1/stories/generate
// BODY: { amountPerGenre: number }
router.post(generateStories);

export const POST = (request: NextRequest, ctx: Context) =>
  handleRequest(router, request, ctx);
