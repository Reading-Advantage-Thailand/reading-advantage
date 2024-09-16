import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { indexPageConfig } from "@/configs/index-page-config";

export default async function StudentHomeLayout({
  children,
}: BaseAppLayoutProps) {
  return (
    <AppLayout
      disableSidebar={false}
      disableProgressBar={true}
      mainNavConfig={indexPageConfig.mainNav}
    >
      {children}
    </AppLayout>
  );
}
