import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { adminPageConfig } from "@/configs/admin-page-config";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: BaseAppLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }
  if (user?.role !== "system" && user?.role !== "admin") {
    return redirect("/");
  }
  return (
    <AppLayout
      mainNavConfig={adminPageConfig.mainNav}
      sidebarNavConfig={adminPageConfig.sidebarNav}
    >
      {children}
    </AppLayout>
  );
}
