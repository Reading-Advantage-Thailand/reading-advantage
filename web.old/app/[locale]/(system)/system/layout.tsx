import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { systemPageConfig } from "@/configs/system-page-config";

export default function LevelPageLayout({ children }: BaseAppLayoutProps) {
  return (
    <AppLayout
      disableSidebar={false}
      disableProgressBar={true}
      mainNavConfig={systemPageConfig.mainNav}
      sidebarNavConfig={systemPageConfig.systemSidebarNav}
    >
      {children}
    </AppLayout>
  );
}
