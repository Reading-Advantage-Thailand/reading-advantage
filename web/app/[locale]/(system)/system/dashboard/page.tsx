import React from "react";
import { Header } from "@/components/header";
import SystemDashboardClient from "@/components/dashboard/system-dashboard-client";

export default async function SystemDashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-18">
        <Header heading="System Dashboard" />
      </div>

      <SystemDashboardClient />
    </>
  );
}
