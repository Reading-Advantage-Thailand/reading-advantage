import { NextRequest, NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import { logRequest } from "@/server/middleware";
import { protect } from "@/server/controllers/auth-controller";
import { getAssignmentMetrics } from "@/server/controllers/assignment-controller";

interface RequestContext {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
router.use(protect);

// GET /api/v1/metrics/assignments
router.get(getAssignmentMetrics);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
