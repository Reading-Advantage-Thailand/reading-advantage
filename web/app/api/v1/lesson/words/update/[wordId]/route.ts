import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { logRequest } from "@/server/middleware";
import { protect } from "@/server/controllers/auth-controller";
import { updateLessonWord, deleteLessonWord } from "@/server/controllers/lesson-controller";

interface RequestContext {
  params: {
    wordId: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.post(updateLessonWord);
router.delete(deleteLessonWord);

export async function POST(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}

export async function DELETE(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
