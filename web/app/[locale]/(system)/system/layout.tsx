import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { systemPageConfig } from "@/configs/system-page-config";

export default function LevelPageLayout({ children }: BaseAppLayoutProps) {
  return (
    <AppLayout
      disableSidebar={true}
      disableProgressBar={true}
      mainNavConfig={systemPageConfig.mainNav}
    >
      {children}
    </AppLayout>
  );
}
