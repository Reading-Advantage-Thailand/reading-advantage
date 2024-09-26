import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { getAllUserActivity } from "@/server/controllers/activity-controller";

export interface RequestContext {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);

//api/activity
router.get(getAllUserActivity);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
