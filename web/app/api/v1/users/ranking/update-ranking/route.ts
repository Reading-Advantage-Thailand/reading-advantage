import { logRequest } from "@/server/middleware";
import { restrictAccessKey } from "@/server/controllers/auth-controller";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { postRankingLeaderboard } from "@/server/controllers/leaderboard-controller";

export interface RequestContext {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(restrictAccessKey);
//api/v1/users/updateActiveUser
router.post(postRankingLeaderboard);

export async function POST(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
