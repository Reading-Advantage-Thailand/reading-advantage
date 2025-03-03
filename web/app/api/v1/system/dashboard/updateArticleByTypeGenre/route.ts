import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { articlesByTypeGenre } from "@/server/controllers/article-controller";
import { restrictAccessKey } from "@/server/controllers/auth-controller";

export interface RequestContext {
  params?: {
    license_id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
router.use(restrictAccessKey);

// API: POST api/v1/system/dashboard/updateArticleByTypeGenre
router.post(articlesByTypeGenre);

export async function POST(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
