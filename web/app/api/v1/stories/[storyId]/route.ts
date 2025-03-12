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

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
