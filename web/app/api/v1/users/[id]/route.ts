import { generateArticleQueue } from "@/server/controllers/generator-controller";
import { getUser, updateUser } from "@/server/controllers/user-controller";
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
router.get(getUser)
router.patch(updateUser);

export const GET = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);
export const PATCH = (request: NextRequest, ctx: Context) => handleRequest(router, request, ctx);