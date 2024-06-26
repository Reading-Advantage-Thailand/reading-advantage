import Passages from '@/components/teacher/passages'
import React from 'react'
import { headers } from 'next/headers'
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Header } from '@/components/header'

export default async function SystemPage() {
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
  console.log('passages', passages.data);

  // async function fetchArticles(params: string) {
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/articles?${params}`
  //   );
  
  //   const data = await response.json();
  //   return data;
  // }
  // const passages = await fetchArticles('type=1&genre=1&subgenre=1');
  
  return (
    <div className='px-[10%]'>
      <Header heading="System Dashboard"/>
      {/* <Passages passages={passages.data} /> */}
      <Passages passages={passages.passages} />
    </div>
  )
}
