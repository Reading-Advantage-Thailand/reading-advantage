import AdminReports from "@/components/admin/reports";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Role } from "@prisma/client";

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return redirect("/auth/signin");
  }

  if (user?.role !== Role.SYSTEM && user?.role !== Role.ADMIN) {
    return redirect("/");
  }

  const ClassesData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom`,
        { 
          method: "GET", 
          headers: headers(),
          cache: 'no-store'
        }
      );
      
      if (!res.ok) throw new Error("Failed to fetch classroom list");
      const fetchdata = await res.json();
      
      return fetchdata.data || [];
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      return [];
    }
  };

  const classData = await ClassesData();

  return (
    <div>
      <AdminReports classes={classData} />
    </div>
  );
}
