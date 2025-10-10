/**
 * Manual refresh endpoint for system administrators
 * 
 * This endpoint requires SYSTEM role authentication
 * Used for manual/on-demand refresh of materialized views
 */

import { refreshMaterializedViews } from "@/server/controllers/system-controller";
import { NextRequest, NextResponse } from "next/server";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { protect } from "@/server/controllers/auth-controller";

interface ExtendedNextRequest {
  params: Record<string, never>;
}

const router = createEdgeRouter<NextRequest, ExtendedNextRequest>();

// Middleware - requires authenticated SYSTEM user
router.use(logRequest);
router.use(protect);
router.post(refreshMaterializedViews);

export async function POST(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
