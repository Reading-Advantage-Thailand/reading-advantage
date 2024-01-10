"use client";
import React, { useEffect, useState, useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import FlashCard from "@/components/flash-card";

type Props = {
  userId: string;
};

export default function TabsPractice ({
  userId
}: Props) {
  return (
    <Tabs.Root className="TabsRoot" defaultValue="tab1">
      <Tabs.List className="TabsList" aria-label="Flashcard Practice">
        <Tabs.Trigger className="TabsTrigger" value="tab1">
          Flashcard Practice
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value="tab2">
          Order Sentences
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value="tab3">
          Close Test
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value="tab4">
          Order Words
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value="tab5">
          Matching
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="TabsContent" value="tab1">
        <FlashCard userId={userId} />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="tab2">
        Order Sentences
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="tab3">
        Close Test
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