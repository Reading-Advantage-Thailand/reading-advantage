import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { logRequest } from "@/server/middleware";
import { protect } from "@/server/controllers/auth-controller";
import { getLessonSentences } from "@/server/controllers/lesson-controller";

interface RequestContext {
  params: {
    articleId: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getLessonSentences);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  throw new Error("Expected a NextResponse from router.run");
}
