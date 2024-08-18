import AppLayout, { BaseAppLayoutProps } from "@/components/shared/app-layout";
import { studentPageConfig } from "@/configs/student-page-config";

export default function RoleSelectionPageLayout({
  children,
}: BaseAppLayoutProps) {
  return (
    <AppLayout
      disableRoleRedirect={true}
      disableLevelRedirect={true}
      disableSidebar={true}
      disableProgressBar={true}
      mainNavConfig={studentPageConfig.mainNav}
    >
      {children}
    </AppLayout>
  );
}
