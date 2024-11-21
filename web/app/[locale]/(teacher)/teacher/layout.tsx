import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { teacherPageConfig } from "@/configs/teacher-page-config";
import { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { MainNav } from "@/components/main-navbar";
import { LocaleSwitcher } from "@/components/switchers/locale-switcher";
import { ThemeSwitcher } from "@/components/switchers/theme-switcher-toggle";
import { UserAccountNav } from "@/components/user-account-nav";
import { cn } from "@/lib/utils";
import Leaderboard from "@/components/teacher/leaderboard";
import { headers } from "next/headers";

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

  const feactlearderboard = async () => {
    if (!user.license_id) return [];
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/ranking/${user.license_id}`,
      { method: "GET", headers: headers() }
    );
    if (!res.ok) throw new Error("Failed to fetch LeaderBoard list");
    const fetchdata = await res.json();
    return fetchdata.results;
  };

  const leaderboard = await feactlearderboard();

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={teacherPageConfig.mainNav} />
          <div className="flex space-x-2">
            <LocaleSwitcher />
            <ThemeSwitcher />
            <UserAccountNav user={user} />
          </div>
        </div>
      </header>
      <div className="container sm:grid sm:flex-1 lg:flex gap-6">
        <aside className="lg:w-[260px] lg:flex-col lg:flex gap-4">
          <SidebarNav items={teacherPageConfig.teacherSidebarNav} />
          <Leaderboard data={leaderboard} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
