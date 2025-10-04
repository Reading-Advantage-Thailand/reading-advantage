import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";
import { protect } from "@/server/controllers/auth-controller";
import { getSystemDashboard } from "@/server/controllers/system-dashboard-controller";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
router.use(protect);

router.get(getSystemDashboard);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  throw new Error("Expected a NextResponse from router.run");
}
