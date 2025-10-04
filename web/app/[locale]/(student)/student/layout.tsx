import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { studentPageConfig } from "@/configs/student-page-config";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function SettingsPageLayout({
  children,
}: BaseAppLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (user.cefr_level === "" && user.level === 0) {
    return redirect("/level");
  }

  if (new Date(user?.expired_date) < new Date() && user?.role !== Role.SYSTEM) {
    return redirect("/contact");
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
