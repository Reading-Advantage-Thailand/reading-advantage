import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { ClassDetailDashboard } from "@/components/dashboard/class-detail-dashboard";

export default async function ClassDetailReportsPage({
  params,
}: {
  params: { classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  // Get classroom data
  const classroom = await prisma.classroom.findUnique({
    where: { id: params.classroomId },
  });

  if (!classroom) {
    return redirect("/th/teacher/dashboard");
  }

  // Verify access
  if (user.role !== Role.SYSTEM && user.role !== Role.ADMIN) {
    const classroomTeacher = await prisma.classroomTeacher.findFirst({
      where: {
        classroomId: params.classroomId,
        teacherId: user.id,
      },
    });

    if (!classroomTeacher) {
      return redirect("/th/teacher/dashboard");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <ClassDetailDashboard
        classroomId={params.classroomId}
        className={classroom.classroomName || "Unnamed Class"}
        classCode={classroom.classCode || "N/A"}
      />
    </div>
  );
}
