import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { updateSystemDashboard } from "@/server/controllers/update-dashboard-controller";
import { restrictAccessKey } from "@/server/controllers/auth-controller";

export interface ExtendedNextRequest {
  params?: {
    licenseId: string;
    classroomId: string;
  };
}

const router = createEdgeRouter<NextRequest, ExtendedNextRequest>();

// Middleware
router.use(logRequest);
router.use(restrictAccessKey);

// API: POST api/v1/dashboard/update-system-dashboard
router.post(updateSystemDashboard);

export async function POST(request: NextRequest, ctx: ExtendedNextRequest) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
