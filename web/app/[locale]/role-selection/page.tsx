import ChangeRole from "@/components/shared/change-role";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";

export default async function FirstRoleSelectionPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <div className="flex justify-center">
      <ChangeRole
        className="md:w-[40rem]"
        userRole={user.role}
        userId={user.id}
        redirectTo="/level"
      />
    </div>
  );
}
