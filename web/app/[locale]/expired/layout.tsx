import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { settingsPageConfig } from "@/configs/settings-page-config";

export default function ExpiredPageLayout({ children }: BaseAppLayoutProps) {
  return (
    <AppLayout
      disableExpriredRedirect={true}
      disableSidebar={true}
      disableProgressBar={true}
      mainNavConfig={settingsPageConfig.mainNav}
      sidebarNavConfig={settingsPageConfig.sidebarNav}
    >
      {children}
    </AppLayout>
  );
}
