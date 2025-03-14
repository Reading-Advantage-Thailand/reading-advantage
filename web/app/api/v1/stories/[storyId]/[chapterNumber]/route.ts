import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";
import { getChapter } from "@/server/controllers/stories-controller";

interface RequestContext {
  params: {
    storyId: string;
    chapterNumber: number;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getChapter);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
