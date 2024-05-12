import ArticleShowcaseCard from '@/components/article-showcase-card'
import { articleShowcaseType } from "@/types";
import React from 'react'
import { headers } from 'next/headers'
import Passages from '@/components/teacher/passages';
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { getScopedI18n } from "@/locales/server";
import { redirect } from "next/navigation";
import Select from "@/components/select";


type Props = {
  article: articleShowcaseType;
};


export default async function PassagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.cefrLevel === "" && user.level === 0) {
    return redirect("/level");
  }
  // const t = await getScopedI18n("pages.student.readPage");

  async function getPassages() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/passage`,
      {
        method: "GET",
        headers: headers(),
      }
    );
    
    return response.json();
  }
  const passages = await getPassages();
  
  return (
    <div>
      <Passages passages={passages.passages}/>
    </div>
  )
}
