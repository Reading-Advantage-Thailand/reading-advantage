import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import TabsPractice from "@/components/tabs";

type Props = {};

export default async function PracticePage({}: Props) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.cefrLevel === "" && user.level === 0) {
    return redirect("/level");
  }
  return (
  <><TabsPractice userId={user.id} /></>);
}
