import { createEdgeRouter } from "next-connect";
import type { NextRequest } from "next/server";
import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import {
  deleteVocabulariesFlashcard,
  getVocabulariesFlashcard,
  postVocabulariesFlashcard,
} from "@/server/controllers/flashcard-controller";

interface RequestContext {
  params: {
    id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(protect);
router.get(getVocabulariesFlashcard);
router.post(postVocabulariesFlashcard);
router.delete(deleteVocabulariesFlashcard);

export async function GET(
  request: NextRequest,
  ctx: RequestContext
): Promise<Response> {
  return handleRouterResponse(await router.run(request, ctx));
}

export async function POST(
  request: NextRequest,
  ctx: RequestContext
): Promise<Response> {
  return handleRouterResponse(await router.run(request, ctx));
}

export async function DELETE(
  request: NextRequest,
  ctx: RequestContext
): Promise<Response> {
  return handleRouterResponse(await router.run(request, ctx));
}

function handleRouterResponse(response: unknown): Response {
  if (response instanceof Response) {
    return response;
  }
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
