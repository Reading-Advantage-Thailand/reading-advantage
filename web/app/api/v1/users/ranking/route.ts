import {
  protect,
  restrictAccessKey,
} from "@/server/controllers/auth-controller";
import {
  getAllRankingLeaderboard,
  postRankingLeaderboard,
} from "@/server/controllers/leaderboard-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

const getRouter = createEdgeRouter<NextRequest, NextResponse>();
getRouter.use(logRequest);
getRouter.use(protect);
getRouter.get(getAllRankingLeaderboard);

export async function GET(request: NextRequest, ctx: NextResponse) {
  const result = await getRouter.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from getRouter.run");
}

const postRouter = createEdgeRouter<NextRequest, NextResponse>();
postRouter.use(logRequest);
postRouter.use(restrictAccessKey);
postRouter.post(postRankingLeaderboard);

export async function POST(request: NextRequest, ctx: NextResponse) {
  const result = await postRouter.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from postRouter.run");
}
