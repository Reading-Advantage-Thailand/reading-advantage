import ChangeRole from "@/components/shared/change-role";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";

export default async function FirstRoleSelectionPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  } else if (user.role === "student") {
    return redirect("/student/read");
  } else if (user.role === "teacher") {
    return redirect("/teacher/my-classes");
  } else if (user.role !== "user") {
    return redirect("/");
  }

  return (
    <div className="flex justify-center">
      <ChangeRole
        className="md:w-[40rem]"
        userRole={user.role}
        userId={user.id}
      />
    </div>
  );
}
