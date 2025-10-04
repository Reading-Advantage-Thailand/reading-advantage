import { protect } from "@/server/controllers/auth-controller";
import { getTeacherAssignments } from "@/server/controllers/teacher-assignment-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

export interface RequestContext {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getTeacherAssignments);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
