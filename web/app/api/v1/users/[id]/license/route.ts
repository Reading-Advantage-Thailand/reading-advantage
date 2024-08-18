import { protect } from "@/server/controllers/auth-controller";
import { activateLicense, deactivateLicense } from "@/server/controllers/license-controller";
import { logRequest } from "@/server/middleware";
import { handleRequest } from "@/server/utils/handle-request";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";

export interface Context {
    params?: {
        id: string;
    };
}

const router = createEdgeRouter<NextRequest, Context>();

// Middleware
router.use(logRequest);
router.use(protect);

// /api/v1/users/[id]/license
router.post(activateLicense);
router.delete(deactivateLicense);

export const POST = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);
export const DELETE = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);