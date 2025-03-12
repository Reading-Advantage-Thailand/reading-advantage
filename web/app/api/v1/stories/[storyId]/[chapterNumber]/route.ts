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
//router.use(protect);

router.get(async (request: NextRequest, ctx: RequestContext) => {
  const { storyId, chapterNumber } = ctx.params;
  return getChapter(storyId, chapterNumber);
});

export async function GET(request: NextRequest, ctx: RequestContext) {
  return router.run(request, ctx);
}
