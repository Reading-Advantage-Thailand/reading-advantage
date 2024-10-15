import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import {
  deleteSentencesFlashcard,
  getSentencesFlashcard,
  postSentendcesFlashcard,
} from "@/server/controllers/flashcard-controller";

interface RequestContext {
  params: {
    id: string;
  };
}
const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getSentencesFlashcard);
router.post(postSentendcesFlashcard);
router.delete(deleteSentencesFlashcard);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}

export async function POST(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}

export async function DELETE(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}