import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";
import { getChapter } from "@/server/controllers/stories-controller";
import { updateAverageRating } from "@/server/controllers/stories-controller";

interface ExtendedNextRequest {
  params: {
    storyId: string;
    chapterNumber: string;
  };
}

const router = createEdgeRouter<NextRequest, ExtendedNextRequest>();

router.use(logRequest);
router.use(protect);
router.get(getChapter);
router.put(updateAverageRating)

export async function GET(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}

export async function PUT(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
