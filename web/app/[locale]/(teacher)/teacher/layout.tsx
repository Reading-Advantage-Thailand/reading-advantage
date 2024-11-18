import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { teacherPageConfig } from "@/configs/teacher-page-config";
import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";

export default async function TeacherHomeLayout({
  children,
}: BaseAppLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }
  if (new Date(user?.expired_date) < new Date() && user?.role !== "system") {
    return redirect("/contact");
  }
  if (
    user?.role !== "system" &&
    user?.role !== "teacher" &&
    user?.role !== "admin"
  ) {
    return redirect("/");
  }

  return (
    <AppLayout
      mainNavConfig={teacherPageConfig.mainNav}
      sidebarNavConfig={teacherPageConfig.teacherSidebarNav}
      disableProgressBar={true}
    >
      {children}
    </AppLayout>
  );
}
