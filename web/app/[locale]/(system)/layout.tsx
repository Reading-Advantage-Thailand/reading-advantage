import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { systemPageConfig } from "@/configs/system-page-config";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LevelPageLayout({
  children,
}: BaseAppLayoutProps) {
  const user = await getCurrentUser();
  if (user?.role !== "system") {
    return redirect("/");
  }
  return (
    <AppLayout
      disableSidebar={false}
      disableProgressBar={true}
      mainNavConfig={systemPageConfig.mainNav}
      sidebarNavConfig={systemPageConfig.systemSidebarNav}
    >
      {children}
    </AppLayout>
  );
}
