import { protect } from "@/server/controllers/auth-controller";
import { getStoryById } from "@/server/controllers/stories-controller";
import { logRequest } from "@/server/middleware";
import { Role } from "@/server/models/enum";
import { handleRequest } from "@/server/utils/handle-request";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";
import { deleteStories } from "@/server/controllers/stories-controller";

interface ExtendedNextRequest {
  params: {
    storyId: string;
  };
}

const router = createEdgeRouter<NextRequest, ExtendedNextRequest>();

// Middleware
router.use(logRequest);
router.use(protect);

//GET /api/v1/stories
router.get(getStoryById);

//DELETE /api/v1/stories/:storyId
router.delete(deleteStories);

export async function GET(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}

export async function DELETE(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
