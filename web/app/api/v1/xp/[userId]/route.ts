import { getLessonXp } from "@/server/controllers/license-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { handleRequest } from "@/server/utils/handle-request";

export interface Context {
  params: {
    userId: string;
  };
}

const router = createEdgeRouter<NextRequest, Context>();

// Middleware
router.use(logRequest);

// /api/xp/[userId]
router.get(getLessonXp);

export const GET = (request: NextRequest, ctx: Context) =>
  handleRequest(router, request, ctx);

