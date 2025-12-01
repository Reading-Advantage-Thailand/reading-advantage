import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import LevelTestChat from "@/components/level-test-chat";

export const metadata = {
  title: "Level grading",
};

export default async function LevelPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <div className="container py-8">
      <LevelTestChat userId={user.id} />
    </div>
  );
}
