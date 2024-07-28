import { MainNav } from "@/components/main-navbar";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserAccountNav } from "@/components/user-account-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeSwitcher } from "@/components/switchers/theme-switcher-toggle";
import { LocaleSwitcher } from "@/components/switchers/locale-switcher";
import { settingsPageConfig } from "@/configs/settings-page-config";
import ProgressBar from "@/components/progress-bar-xp";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";

interface SettingsPageLayoutProps {
  children?: React.ReactNode;
}

export default async function SettingsPageLayout({
  children,
}: SettingsPageLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <NextAuthSessionProvider session={user}>
      <div className="flex min-h-screen flex-col space-y-6">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav items={settingsPageConfig.mainNav} />
            <ProgressBar progress={user.xp} level={user.level!} />
            <div className="flex space-x-2">
              <LocaleSwitcher />
              <ThemeSwitcher />
              <UserAccountNav user={user} />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 lg:grid lg:flex-1 gap-12 lg:grid-cols-[200px_1fr]">
          <aside className="lg:w-[200px] lg:flex-col lg:flex">
            <SidebarNav items={settingsPageConfig.sidebarNav} />
          </aside>
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </NextAuthSessionProvider>
  );
}
