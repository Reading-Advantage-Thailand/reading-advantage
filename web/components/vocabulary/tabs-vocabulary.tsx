"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScopedI18n } from "@/locales/client";
import FlashCard from "./tab-flash-card";
import MatchingWords from "./tab-matching-words";
type Props = {
  userId: string;
  userXP: number;
  userLevel: number;
};

export default function TabsVocabulary({ userId, userLevel, userXP }: Props) {
  const [showButton, setShowButton] = useState(true);
  const t = useScopedI18n("components.wordList.tab");

  return (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList className="h-fit grid grid-cols-1 md:grid-cols-6">
        <TabsTrigger value="tab1">{t("flashcard").toString()}</TabsTrigger>
        <TabsTrigger value="tab5">{t("matching").toString()}</TabsTrigger>
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

      <TabsContent className="space-y-2" value="tab5">
        <MatchingWords userId={userId} userXP={userXP} userLevel={userLevel} />
      </TabsContent>
    </Tabs>
  );
}
