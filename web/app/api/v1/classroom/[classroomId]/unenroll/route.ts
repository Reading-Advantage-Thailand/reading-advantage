import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";
import { protect } from "@/server/controllers/auth-controller";
import { patchClassroomUnenroll } from "@/server/controllers/classroom-controller";

interface RequestContext {
  params: {
    classroomId: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
router.use(protect);

router.patch(patchClassroomUnenroll);

export async function PATCH(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
