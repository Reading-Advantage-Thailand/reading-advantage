import { restrictTo } from "@/server/controllers/auth-controller";
import { getLicenseAllRecords } from "@/server/controllers/license-controller";
import { logRequest } from "@/server/middleware";
import { Role } from "@/server/models/enum";
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
router.use(restrictTo(Role.SYSTEM));

// /api/v1/license/[id]/records
router.get(getLicenseAllRecords);

export const GET = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);
