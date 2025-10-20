/**
 * Automated refresh endpoint for Cloud Scheduler/Trigger
 * 
 * This endpoint uses restrictAccessKey for authentication (no user login required)
 * Designed to be called by Google Cloud Scheduler every 15 minutes
 */

import { refreshMaterializedViewsAutomated } from "@/server/controllers/system-controller";
import { NextRequest, NextResponse } from "next/server";
import { restrictAccessKey } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";

interface ExtendedNextRequest {
  params: Record<string, never>;
}

const router = createEdgeRouter<NextRequest, ExtendedNextRequest>();

// Middleware - only access key required (for Cloud Scheduler)
router.use(logRequest);
router.use(restrictAccessKey);

router.post(refreshMaterializedViewsAutomated);

export async function POST(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
