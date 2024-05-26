import { MainNav } from "@/components/main-navbar";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { studentPageConfig } from "@/configs/student-page-config";
import { UserAccountNav } from "@/components/user-account-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeSwitcher } from "@/components/switchers/theme-switcher-toggle";
import { LocaleSwitcher } from "@/components/switchers/locale-switcher";
import ProgressBar from "@/components/progress-bar-xp";
import FloatingChatButton from '@/components/chatbot/floating-button'

interface StudentHomeLayoutProps {
  children?: React.ReactNode;
}

export default async function StudentHomeLayout({
  children,
}: StudentHomeLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={studentPageConfig.mainNav} />
          <ProgressBar progress={user.xp} level={user.level} />
          <div className="flex space-x-2">
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
        <aside className="lg:w-[200px] lg:flex-col lg:flex">
          <SidebarNav items={studentPageConfig.sidebarNav} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
        <FloatingChatButton />
      </div>
    </div>
  );
}
