// teacher layout
import { MainNav } from "@/components/main-navbar";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { studentPageConfig } from "@/configs/student-page-config";
import { teacherPageConfig } from "@/configs/teacher-page-config";
import { UserAccountNav } from "@/components/user-account-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeSwitcher } from "@/components/switchers/theme-switcher-toggle";
import { LocaleSwitcher } from "@/components/switchers/locale-switcher";
import ProgressBar from "@/components/progress-bar-xp";
import { SidebarTeacherNav } from "@/components/teacher/sidebar-teacher-nav";

interface TeacherHomeLayoutProps {
  children?: React.ReactNode;
}

export default async function TeacherHomeLayout({
  children,
}: TeacherHomeLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }
  if (
    user?.role !== "system" &&
    user?.role !== "teacher" &&
    user?.role !== "admin"
  ) {
    return redirect("/");
  }

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
      <div className="container mx-auto px-4 flex flex-col lg:grid gap-6 lg:grid-cols-[200px_1fr] lg:gap-12">
        <aside className="lg:w-[200px] lg:flex-col lg:flex md:sticky lg:sticky top-[80px] lg:h-[calc(100vh_-_80px)] z-[10]">
          <SidebarTeacherNav items={teacherPageConfig.teacherSidebarNav} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
