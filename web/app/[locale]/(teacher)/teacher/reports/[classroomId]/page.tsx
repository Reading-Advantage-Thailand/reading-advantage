import Reports from "@/components/teacher/reports";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ReportsClassroomPage({
  params,
}: {
  params: { classroomId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <div>
      <Reports />
    </div>
  );
}
