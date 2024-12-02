import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { adminPageConfig } from "@/configs/admin-page-config";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: BaseAppLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }
  if (new Date(user?.expired_date) < new Date() && user?.role !== "system") {
    return redirect("/contact");
  }
  if (user?.role !== "system" && user?.role !== "admin") {
    return redirect("/");
  }
  return (
    <AppLayout
      mainNavConfig={adminPageConfig.mainNav}
      sidebarNavConfig={adminPageConfig.sidebarNav}
      disableLeaderboard={true}
    >
      {children}
    </AppLayout>
  );
}
