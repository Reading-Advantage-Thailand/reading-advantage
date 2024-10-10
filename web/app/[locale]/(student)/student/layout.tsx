import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { studentPageConfig } from "@/configs/student-page-config";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SettingsPageLayout({
  children,
}: BaseAppLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }
  if (
    user?.role !== "system" &&
    user?.role !== "admin" &&
    user?.role !== "teacher" &&
    user?.role !== "student"
  ) {
    return redirect("/");
  }
  return (
    <AppLayout
      mainNavConfig={studentPageConfig.mainNav}
      sidebarNavConfig={studentPageConfig.sidebarNav}
    >
      {children}
    </AppLayout>
  );
}
