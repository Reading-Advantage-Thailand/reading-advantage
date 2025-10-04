import { getSchoolXpData } from "@/server/controllers/system-controller";
import { NextRequest, NextResponse } from "next/server";
import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";

interface ExtendedNextRequest {
  params: {
    userId?: string;
  };
}

const router = createEdgeRouter<NextRequest, ExtendedNextRequest>();

// Middleware
router.use(logRequest);
router.use(protect);

router.get(getSchoolXpData);

export async function GET(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
