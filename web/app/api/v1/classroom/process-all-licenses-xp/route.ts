import { logRequest } from "@/server/middleware";
import { restrictAccessKey } from "@/server/controllers/auth-controller";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { processAllLicensesXP } from "@/server/controllers/classroom-controller";

export interface RequestContext {
  params: {
    classroomId: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
//router.use(restrictAccessKey);

router.get(processAllLicensesXP);

// Export API Route for Next.js
export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
