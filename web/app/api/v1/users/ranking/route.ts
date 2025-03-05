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

const router = createEdgeRouter<NextRequest, NextResponse>();

router.use(logRequest);
router.use(protect);
router.get(getAllRankingLeaderboard);

export async function GET(request: NextRequest, ctx: NextResponse) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}

router.use(restrictAccessKey);
router.post(postRankingLeaderboard);

export async function POST(request: NextRequest, ctx: NextResponse) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
