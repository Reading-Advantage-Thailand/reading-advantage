import React from "react";
import { Header } from "@/components/header";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import UnauthorizedPage from "@/components/shared/unauthorized-page";
import DashboardContent from "@/components/admin/dashboard-content";
import { Role } from "@prisma/client";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (!user.license_id) {
    return <UnauthorizedPage />;
  }

  const getDashboradData = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/admin/dashboard`,
      { method: "GET", headers: headers(), cache: 'no-store' }
    );
    const fetchdata = await res.json();
    return fetchdata.data;
  };

  // Get all licenses if user is SYSTEM
  const getAllLicensesData = async () => {
    if (user.role !== Role.SYSTEM) {
      return [];
    }
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/licenses`,
        { method: "GET", headers: headers(), cache: 'no-store' }
      );
      const fetchdata = await res.json();
      return fetchdata.data || [];
    } catch (error) {
      console.error("Error fetching licenses:", error);
      return [];
    }
  };

  const dataDashboard = await getDashboradData();
  const allLicenses = await getAllLicensesData();

  return (
    <>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold truncate mb-6">
        <Header heading="Admin Dashboard Page" />
      </div>
      <DashboardContent
        initialData={dataDashboard}
        userRole={user.role}
        allLicenses={allLicenses}
      />
    </>
  );
}
