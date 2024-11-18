import React from "react";
import MyClasses from "@/components/teacher/my-classes";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
//import { ClassesData } from "@/lib/classroom-utils";

export default async function MyClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const ClassesData = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/classroom`,
      { method: "GET", headers: headers() }
    );
    if (!res.ok) throw new Error("Failed to fetch ClassesData list");
    const fetchdata = await res.json();

    if (user.role === "system") {
      return fetchdata.data;
    }
    return fetchdata.data.filter(
      (classroom: { teacherId: string }) => classroom.teacherId === user.id
    );
  };

  const res = await ClassesData();

  return (
    <div>
      <MyClasses
        userId={user.id}
        userName={user.display_name}
        classrooms={res}
      />
    </div>
  );
}
