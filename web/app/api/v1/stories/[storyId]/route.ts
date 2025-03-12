import { protect } from "@/server/controllers/auth-controller";
import { getStoryById } from "@/server/controllers/stories-controller";
import { logRequest } from "@/server/middleware";
import { Role } from "@/server/models/enum";
import { handleRequest } from "@/server/utils/handle-request";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

export interface Context {
  params: {
    storyId: string;
  };
}

const router = createEdgeRouter<NextRequest, Context>();

// Middleware
router.use(logRequest);
//router.use(protect);

//GET /api/v1/stories
router.get(getStoryById);

export const GET = (request: NextRequest, ctx: Context) =>
  handleRequest(router, request, ctx);
