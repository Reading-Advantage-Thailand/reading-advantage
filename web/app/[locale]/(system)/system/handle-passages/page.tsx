import React from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import System from "@/components/system-articles";
import { fetchMoreArticles } from "@/lib/fetchMoreArticles";

export default async function SystemPage({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.cefrLevel === "" && user.level === 0) {
    return redirect("/level");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4">
        <Header heading="Handle Passages" />
      </div>
    <main className="container mx-auto px-4 flex-1 py-6">
      <System fetchMoreData={fetchMoreArticles} />
    </main>
  </div>
  );
}
