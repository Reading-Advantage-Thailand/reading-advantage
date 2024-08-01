"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlashCard from "@/components/flash-card";
import OrderSentences from "@/components/dnd/order-sentences";
import ClozeTest from "@/components/cloze-test";
import OrderWords from "@/components/order-words";
import Matching from "@/components/matching";
import ManageTab from "./manage-tab";
import { useScopedI18n } from "@/locales/client";

type Props = {
  userId: string;
  userXP: number;
  userLevel: number;
};

export default function TabsPractice({ userId, userLevel, userXP }: Props) {
  const [showButton, setShowButton] = useState(true);
  const t = useScopedI18n("pages.student.practicePage");

  return (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList className="h-fit grid grid-cols-1 md:grid-cols-6">
        <TabsTrigger value="tab1">{t("flashcard").toString()}</TabsTrigger>
        <TabsTrigger value="tab2">{t("orderSentences").toString()}</TabsTrigger>
        <TabsTrigger value="tab3">{t("clozeTest").toString()}</TabsTrigger>
        <TabsTrigger value="tab4">{t("orderWords").toString()}</TabsTrigger>
        <TabsTrigger value="tab5">{t("matching").toString()}</TabsTrigger>
        <TabsTrigger value="tab6">{t("manage").toString()}</TabsTrigger>
      </TabsList>
      <TabsContent className="space-y-2" value="tab1">
        <FlashCard
          userId={userId}
          showButton={showButton}
          setShowButton={setShowButton}
          userXP={userXP}
          userLevel={userLevel}
        />
      </TabsContent>
      <TabsContent className="space-y-2" value="tab2">
        <OrderSentences userId={userId} userXP={userXP} userLevel={userLevel} />
      </TabsContent>
      <TabsContent className="space-y-2" value="tab3">
        <ClozeTest userId={userId} userXP={userXP} userLevel={userLevel} />
      </TabsContent>
      <TabsContent className="space-y-2" value="tab4">
        <OrderWords userId={userId} userXP={userXP} userLevel={userLevel} />
      </TabsContent>
      <TabsContent className="space-y-2" value="tab5">
        <Matching userId={userId} userXP={userXP} userLevel={userLevel} />
      </TabsContent>
      <TabsContent className="space-y-2" value="tab6">
        <ManageTab userId={userId} />
      </TabsContent>
    </Tabs>
  );
}
