import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { NextAuthSessionProvider } from "../providers/nextauth-session-provider";
import { MainNav } from "@/components/main-navbar";
import { UserAccountNav } from "@/components/user-account-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import ProgressBar from "@/components/progress-bar-xp";
import { NavItem, SidebarNavItem } from "@/types";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children?: React.ReactNode;
  mainNavConfig: NavItem[];
  sidebarNavConfig: SidebarNavItem[];
  disableProgressBar?: boolean;
  disableSidebar?: boolean;
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
}: AppLayoutProps) {
  const user = await getCurrentUser();

  // Redirect to sign in page if user is not logged in
  if (!user) {
    return redirect("/auth/signin");
  }

  // Redirect to level selection page if user has not selected a level
  // if (user.level === undefined || user.cefr_level === "") {
  //   return redirect("/level");
  // }

  return (
    <NextAuthSessionProvider session={user}>
      <div className="flex min-h-screen flex-col space-y-6">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav items={mainNavConfig} />
            {!disableProgressBar && (
              <ProgressBar progress={user.xp} level={user.level!} />
            )}
            <div className="flex space-x-2">
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
              <SidebarNav items={sidebarNavConfig} />
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
