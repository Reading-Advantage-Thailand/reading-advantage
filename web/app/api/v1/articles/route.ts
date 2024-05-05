import { getSearchArticles } from "@/controllers/article_controller";
import { logRequest } from "@/utils/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";


const router = createEdgeRouter<NextRequest, { params?: unknown }>();

router.use(logRequest);

// Middleware
// router.use(async (
//     req: NextRequest,
//     params: unknown,
//     next: () => void
// ) => {


//     // Check level is be the same as the user's level
//     const userLevel = session.user.level;
//     const level = new Number(req.nextUrl.searchParams.get('level')).valueOf();
//     if (level !== userLevel) {
//         req.nextUrl.searchParams.set('level', userLevel.toString());
//     }
//     return next();
// });

router.get(getSearchArticles);

export async function GET(request: NextRequest, ctx: { params?: unknown }) {
    return router.run(request, ctx);
}
