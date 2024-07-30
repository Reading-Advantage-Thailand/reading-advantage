import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { studentPageConfig } from "@/configs/student-page-config";

export default function SettingsPageLayout({ children }: BaseAppLayoutProps) {
  return (
    <AppLayout
      disableProgressBar={true}
      mainNavConfig={studentPageConfig.mainNav}
      sidebarNavConfig={studentPageConfig.sidebarNav}
    >
      {children}
    </AppLayout>
  );
}
