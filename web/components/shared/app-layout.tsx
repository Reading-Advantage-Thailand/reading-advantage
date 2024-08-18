import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { NextAuthSessionProvider } from "../providers/nextauth-session-provider";
import { MainNav } from "@/components/main-navbar";
import { UserAccountNav } from "@/components/user-account-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import ProgressBar from "@/components/progress-bar-xp";
import { NavItem, SidebarNavItem } from "@/types";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/switchers/theme-switcher-toggle";
import { LocaleSwitcher } from "@/components/switchers/locale-switcher";
import { Role } from "@/server/models/enum";
import ExpireAlertBanner from "./banners/expire-alert-banner";

interface AppLayoutProps {
  children?: React.ReactNode;
  mainNavConfig: NavItem[];
  sidebarNavConfig?: SidebarNavItem[];
  disableProgressBar?: boolean;
  disableSidebar?: boolean;
  disableRoleRedirect?: boolean;
  disableLevelRedirect?: boolean;
  disableExpriredRedirect?: boolean;
}

export interface BaseAppLayoutProps {
  children?: React.ReactNode;
}

export default async function AppLayout({
  children,
  mainNavConfig,
  sidebarNavConfig,
  disableProgressBar,
  disableSidebar,
  disableRoleRedirect,
  disableLevelRedirect,
  disableExpriredRedirect,
}: AppLayoutProps) {
  const user = await getCurrentUser();
  // Redirect to sign in page if user is not logged in
  if (!user) {
    return redirect("/auth/signin");
  }

  if (!disableRoleRedirect && user.role === Role.UNKNOWN) {
    return redirect("/role-selection");
  }

  if (
    !disableLevelRedirect &&
    (user.level === undefined || user.level === null || user.level === 0)
  ) {
    return redirect("/level");
  }

  if (!disableExpriredRedirect && user.expired && user.role !== Role.SYSTEM) {
    return redirect("/expired");
  }

  return (
    <NextAuthSessionProvider session={user}>
      <ExpireAlertBanner
        expireDate={user.expired_date}
        expired={user.expired}
      />
      <div className="flex min-h-screen flex-col space-y-6">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav items={mainNavConfig} />
            {!disableProgressBar && (
              <ProgressBar progress={user.xp} level={user.level!} />
            )}
            <div className="flex space-x-2">
              <LocaleSwitcher />
              <ThemeSwitcher />
              <UserAccountNav user={user} />
            </div>
          </div>
        </header>
        <div
          className={cn(
            "container",
            disableSidebar
              ? "grid flex-1 gap-12"
              : "mx-auto px-4 lg:grid lg:flex-1 gap-12 lg:grid-cols-[200px_1fr]"
          )}
        >
          {!disableSidebar && (
            <aside className="lg:w-[200px] lg:flex-col lg:flex">
              <SidebarNav items={sidebarNavConfig || []} />
            </aside>
          )}
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </NextAuthSessionProvider>
  );
}
