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
    try{
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/passage`,
        {
          method: "GET",
          headers: headers(),
        }
      );
      const res = await response.json();
      return res;
      // return res.data;
    } catch (error) {
      console.error('failed to fetch passages: ', error);
      return [];
    }

  }
  const passages = await getPassages();
  
  return (
    <div className='px-[10%]'>
      <Header heading="System Dashboard"/>
      <Passages passages={passages.passages}  />
    </div>
  )
}
