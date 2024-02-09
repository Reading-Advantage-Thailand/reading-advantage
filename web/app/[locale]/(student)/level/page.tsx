import { headers } from "next/headers";
import { NextAuthSessionProvider } from "@/components/providers/nextauth-session-provider";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import FirstRunLevelTest from "@/components/first-run-level-test";
import LevelSelect from "@/components/level-select";

type Props = {
  userId: string;
};
export const metadata = {
  title: "Level grading",
};

export default async function LevelPage({}: Props) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.level > 0) {
    return redirect("/student/read");
  }

  async function getLevelTestData() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/level-test`,
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
      <NextAuthSessionProvider session={user}>
        {/* <LevelSelect userId={user.id} /> */}
        <FirstRunLevelTest
          userId={user.id}
          language_placement_test={
            resGeneralDescription.language_placement_test
          }
        />
      </NextAuthSessionProvider>
    </>
  );
}
