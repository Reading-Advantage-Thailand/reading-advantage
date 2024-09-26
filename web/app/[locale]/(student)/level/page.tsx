import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import FirstRunLevelTest from "@/components/first-run-level-test";
import { getScopedI18n } from "@/locales/server";

export const metadata = {
  title: "Level grading",
};

export default async function LevelPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  async function getLevelTestData() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/level-test`,
      {
        method: "GET",
        headers: headers(),
      }
    );
    return res.json();
  }

  const resGeneralDescription = await getLevelTestData();
  return (
    <>
      <FirstRunLevelTest
        userId={user.id}
        language_placement_test={resGeneralDescription.language_placement_test}
      />
    </>
  );
}
