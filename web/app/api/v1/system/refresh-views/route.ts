import { refreshMaterializedViews } from "@/server/controllers/system-controller";
import { NextRequest, NextResponse } from "next/server";
import { restrictAccessKey } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";

interface ExtendedNextRequest {
  params: Record<string, never>;
}

const router = createEdgeRouter<NextRequest, ExtendedNextRequest>();

// Middleware
router.use(logRequest);
router.use(restrictAccessKey);

router.post(refreshMaterializedViews);

export async function POST(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
