import { MainNav } from "@/components/main-navbar";
import { UserAccountNav } from "@/components/user-account-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import ProgressBar from "@/components/progress-bar-xp";
import { NavItem, SidebarNavItem } from "@/types";
import { User } from "next-auth";
import { Role } from "@/server/models/enum";
import { cloneElement } from "react";

interface PageLayoutProps {
  children?: React.ReactNode;
  mainNavConfig: NavItem[];
  sidebarNavConfig: SidebarNavItem[];
  disableProgressBar?: boolean;
  user: User & {
    id: string;
    email: string;
    display_name: string;
    role: Role;
    level?: number;
    email_verified: boolean;
    picture: string;
    xp: number;
    cefr_level?: string;
    expired_date: string;
    expired?: boolean;
  };
}

export interface BaseLayoutProps {
  children?: React.ReactNode;
  user: User & {
    id: string;
    email: string;
    display_name: string;
    role: Role;
    level?: number;
    email_verified: boolean;
    picture: string;
    xp: number;
    cefr_level?: string;
    expired_date: string;
    expired?: boolean;
  };
}

export default function PageLayout({
  children,
  mainNavConfig,
  sidebarNavConfig,
  disableProgressBar,
  user,
}: PageLayoutProps) {
  return (
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
      <div className="container mx-auto px-4 lg:grid lg:flex-1 gap-12 lg:grid-cols-[200px_1fr]">
        <aside className="lg:w-[200px] lg:flex-col lg:flex">
          <SidebarNav items={sidebarNavConfig} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {cloneElement(children as React.ReactElement, { user })}
        </main>
      </div>
    </div>
  );
}
