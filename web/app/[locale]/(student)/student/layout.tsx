import { Footer } from "@/components/footer";
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

  if (new Date(user?.expired_date) < new Date() && user?.role !== "system") {
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
