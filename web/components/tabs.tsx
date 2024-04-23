"use client";
import React, { useState } from "react";
// import * as Tabs from "@radix-ui/react-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FlashCard from "@/components/flash-card";
import OrderSentences from "@/components/dnd/order-sentences";
import ClozeTest from "@/components/cloze-test";


type Props = {
  userId: string;
};

export default function TabsPractice({ userId }: Props) {
   const [showButton, setShowButton] = useState(true);
   return (
     <Tabs defaultValue="tab1" className="w-full flex flex-col">
       <TabsList className="flex shrink">
         <TabsTrigger value="tab1" className="w-full">
           Flashcard Practice
         </TabsTrigger>
         <TabsTrigger value="tab2" className="w-full">Order Sentences</TabsTrigger>
         <TabsTrigger value="tab3" className="w-full">Cloze Test</TabsTrigger>
         <TabsTrigger value="tab4" className="w-full">Order Words</TabsTrigger>
         <TabsTrigger value="tab5" className="w-full">Matching</TabsTrigger>
       </TabsList>
       <TabsContent className="space-y-2" value="tab1">
         <FlashCard
           userId={userId}
           showButton={showButton}
           setShowButton={setShowButton}
         />
       </TabsContent>
       <TabsContent className="space-y-2" value="tab2">
         <OrderSentences userId={userId} />
       </TabsContent>
       <TabsContent className="space-y-2" value="tab3">
         <ClozeTest userId={userId} />
       </TabsContent>
       <TabsContent className="space-y-2" value="tab4">
         Order Words
       </TabsContent>
       <TabsContent className="space-y-2" value="tab5">
         Matching
       </TabsContent>
     </Tabs>
   );

}
/*
export default function TabsPractice({ userId }: Props) {
  const [showButton, setShowButton] = useState(true);
  return (
    <Tabs.Root className="TabsRoot" defaultValue="tab1">
      <Tabs.List className="TabsList" aria-label="Flashcard Practice">
        <Tabs.Trigger className="TabsTrigger" value="tab1">
          Flashcard Practice
        </Tabs.Trigger>
        <Tabs.Trigger
          className="TabsTrigger"
          value="tab2"
          // disabled={showButton}
        >
          Order Sentences
        </Tabs.Trigger>
        <Tabs.Trigger
          className="TabsTrigger"
          value="tab3"
          // disabled={showButton}
        >
          Cloze Test
        </Tabs.Trigger>
        <Tabs.Trigger
          className="TabsTrigger"
          value="tab4"
          // disabled={showButton}
        >
          Order Words
        </Tabs.Trigger>
        <Tabs.Trigger
          className="TabsTrigger"
          value="tab5"
          // disabled={showButton}
        >
          Matching
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="TabsContent" value="tab1">
        <FlashCard
          userId={userId}
          showButton={showButton}
          setShowButton={setShowButton}
        />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="tab2">
        <OrderSentences userId={userId} />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="tab3">
        <ClozeTest userId={userId} />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="tab4">
        Order Words
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="tab5">
        Matching
      </Tabs.Content>
    </Tabs.Root>
  );
}
*/
