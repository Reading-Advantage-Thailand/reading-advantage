import { protect } from "@/server/controllers/auth-controller";
import { translateStorySummary } from "@/server/controllers/translation-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

interface RequestContext {
  params: {
    storyId: string;
    chapterNumber: string;
  };
}
const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.post(translateStorySummary);

export async function POST(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
