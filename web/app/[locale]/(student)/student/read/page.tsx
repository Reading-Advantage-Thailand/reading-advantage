import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { getScopedI18n } from "@/locales/server";
import { redirect } from "next/navigation";
import React from "react";
import Select from "@/components/select";

type Props = {
  params: { articleId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ReadPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

  const t = await getScopedI18n("pages.student.readPage");
  return (
    <>
      <Header heading={t("articleSelection")} />
      <Select
        user={{
          level: user?.level,
          name: user?.display_name,
          id: user?.id,
        }}
      />
    </>
  );
}

