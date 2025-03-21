import { logRequest } from "@/server/middleware";
import { getAllRankingLeaderboard } from "@/server/controllers/leaderboard-controller";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { protect } from "@/server/controllers/auth-controller";

export interface RequestContext {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
//api/v1/users/updateActiveUser
router.get(getAllRankingLeaderboard);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
