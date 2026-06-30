import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";
import { protect } from "@/server/controllers/auth-controller";
import { archivedClassroom } from "@/server/controllers/classroom-controller";

interface RequestContext {
  params: Promise<{
    classroomId: string;
  }>;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// เปิดใช้งานระบบบันทึกคำขอและระบบความปลอดภัยตรวจสอบสิทธิ์ผู้ใช้
router.use(logRequest);
router.use(protect);

// เชื่อมโยงคำสั่ง PATCH ไปยังฟังก์ชันจัดการสถานะจัดเก็บห้องเรียนที่สะกดถูกต้อง
router.patch(archivedClassroom) as any;

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}

export async function PATCH(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
