import React from 'react'
import { headers } from 'next/headers'
import Passages from '@/components/teacher/passages';
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PassagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.cefrLevel === "" && user.level === 0) {
    return redirect("/level");
  }


  async function getPassages() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/passage`,
      {
        method: "GET",
        headers: headers(),
      }
    );
    const res = await response.json();
    return res;
  }
  const passages = await getPassages();

  return (
    <div>

      <Passages passages={passages.passages} />
    </div>
  )
}
