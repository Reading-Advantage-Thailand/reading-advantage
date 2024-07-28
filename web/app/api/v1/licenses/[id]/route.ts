import { activateLicense, generateLicenseKey, getAllLicenses } from "@/server/controllers/license-controller";
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
// router.use(restrictAccess);

// /api/v1/users/[id]
router.get(getAllLicenses);
router.post(generateLicenseKey);
router.patch(activateLicense);

export const GET = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);
export const POST = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);
export const PATCH = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);