import { logRequest } from "@/server/middleware";
import { protect } from "@/server/controllers/auth-controller";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { getUserActivityByLicense } from "@/server/controllers/activity-controller";

export interface RequestContext {
  params?: {
    license_id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
//api/activity/license_id
router.get(async (req, ctx) => {
  const licenseId = ctx.params?.license_id;

  if (!licenseId) {
    return NextResponse.json(
      { message: "Missing license_id parameter" },
      { status: 400 }
    );
  }

  return await getUserActivityByLicense(licenseId);
});

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
