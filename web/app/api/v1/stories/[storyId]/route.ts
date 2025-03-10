import { protect } from "@/server/controllers/auth-controller";
import { getStoryById } from "@/server/controllers/stories-controller";
import { logRequest } from "@/server/middleware";
import { Role } from "@/server/models/enum";
import { handleRequest } from "@/server/utils/handle-request";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {
  params: {
    storyId: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
//router.use(protect);

//GET /api/v1/stories
router.get(async (request: NextRequest, { params }) => {
  const { storyId } = params;
  return getStoryById(storyId);
});

export async function GET(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  return router.run(request, { params });
}
