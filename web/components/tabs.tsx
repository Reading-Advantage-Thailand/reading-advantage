"use client";
import React, { useState } from "react";
// import * as Tabs from "@radix-ui/react-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FlashCard from "@/components/flash-card";
import OrderSentences from "@/components/dnd/order-sentences";
import ClozeTest from "@/components/cloze-test";
import OrderWords from "@/components/order-words";


type Props = {
  userId: string;
};

export default function TabsPractice({ userId }: Props) {
   const [showButton, setShowButton] = useState(true);
   return (
     <Tabs
       defaultValue="tab1"
       //  className="flex flex-wrap lg:grid items-start gap-2 mb-4 lg:mb-0"
       className="flex flex-wrap items-start mb-4 gap-2"
     >
       <TabsList className="flex">
         <TabsTrigger value="tab1" className="w-full">
           Flashcard Practice
         </TabsTrigger>
         <TabsTrigger value="tab2" className="w-full">
           Order Sentences
         </TabsTrigger>
         <TabsTrigger value="tab3" className="w-full">
           Cloze Test
         </TabsTrigger>
         <TabsTrigger value="tab4" className="w-full">
           Order Words
         </TabsTrigger>
         <TabsTrigger value="tab5" className="w-full">
           Matching
         </TabsTrigger>
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
         <OrderWords userId={userId} />
       </TabsContent>
       <TabsContent className="space-y-2" value="tab5">
         Matching
       </TabsContent>
     </Tabs>
   );

}

