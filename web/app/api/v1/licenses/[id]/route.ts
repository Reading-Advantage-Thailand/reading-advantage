import { restrictTo } from "@/server/controllers/auth-controller";
import {
  deleteLicense,
  activateLicense,
  getLicense,
} from "@/server/controllers/license-controller";
import { logRequest } from "@/server/middleware";
import { Role } from "@prisma/client";
import { handleRequest } from "@/server/utils/handle-request";
import { get } from "lodash";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

export interface RequestContext {
  params: {
    id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
router.use(restrictTo(Role.SYSTEM));

// /api/license/[id]
router.get(getLicense);
router.patch(activateLicense);
router.delete(deleteLicense);

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}

export async function PATCH(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}

export async function DELETE(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  // Handle the case where result is not a NextResponse
  // You might want to return a default NextResponse or throw an error
  throw new Error("Expected a NextResponse from router.run");
}
