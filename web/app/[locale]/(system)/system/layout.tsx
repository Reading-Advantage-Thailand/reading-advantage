//Back Up layout for system
import { MainNav } from "@/components/main-navbar";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { systemPageConfig } from "@/configs/system-page-config";
import { UserAccountNav } from "@/components/user-account-nav";
import ProgressBar from "@/components/progress-bar-xp";
import { LocaleSwitcher } from "@/components/switchers/locale-switcher";
import { ThemeSwitcher } from "@/components/switchers/theme-switcher-toggle";
import { SystemSidebarNav } from "@/components/system/system-sidebar-nav";
import { studentPageConfig } from "@/configs/student-page-config";

interface RoleLayoutProps {
  children?: React.ReactNode;
}

export default async function StudentHomeLayout({ children }: RoleLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center space-x-2 py-4 justify-between">
          <MainNav items={systemPageConfig.mainNav} />
          <div className="space-x-2 flex">
            <LocaleSwitcher />
            <ThemeSwitcher />
            <UserAccountNav
              user={{
                name: user.name || "",
                image: user.image || "",
                email: user.email || "",
                level: user.level || 0,
                verified: user.verified || false,
                role: user.role || "",
                cefrLevel: user.cefrLevel || "",
              }}
            />
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 lg:grid lg:flex-1 gap-12 lg:grid-cols-[200px_1fr]">
        <aside className="lg:w-[200px] lg:flex-col lg:flex sticky top-[80px] h-[calc(100vh_-_80px)] z-[10]">
          <SystemSidebarNav items={systemPageConfig.systemSidebarNav} />
        </aside>
        <main className="flex w-full flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
