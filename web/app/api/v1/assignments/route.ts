import { protect } from "@/server/controllers/auth-controller";
import {
  getAssignments,
  postAssignment,
  updateAssignment,
} from "@/server/controllers/assignment-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

const router = createEdgeRouter<NextRequest, NextResponse>();

router.use(logRequest);
router.use(protect);
//GET /api/v1/assignments?classroomId=abc123&articleId=xyz456
router.get(getAssignments);
// POST /api/v1/assignments {request body with classroomId, articleId, title, description, dueDate, selectedStudents, userId}
router.post(postAssignment);
router.put(updateAssignment);

export async function GET(request: NextRequest) {
  const ctx = NextResponse.next();
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}

export async function POST(request: NextRequest) {
  const ctx = NextResponse.next();
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}

export async function PUT(request: NextRequest) {
  const ctx = NextResponse.next();
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
