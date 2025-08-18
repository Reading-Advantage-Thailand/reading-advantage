"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyDeckProps {
  type: "vocabulary" | "sentences";
}

export default function EmptyDeck({ type }: EmptyDeckProps) {
  const router = useRouter();

  const isVocabulary = type === "vocabulary";

  const handleAddCards = () => {
    // Navigate to articles or lessons to add new cards
    router.push("/student/read");
  };

  return (
    <Card className="text-center py-12">
      <CardHeader>
        {isVocabulary ? (
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        ) : (
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        )}
        <CardTitle className="text-xl">
          No {isVocabulary ? "Vocabulary" : "Sentence"} Cards Yet
        </CardTitle>
        <CardDescription className="max-w-md mx-auto">
          {isVocabulary
            ? "Start reading articles and save vocabulary words to create your first flashcard deck."
            : "Start reading articles and save sentences to create your first flashcard deck."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddCards} className="gap-2">
          <Plus className="h-4 w-4" />
          Start Reading Articles
        </Button>
      </CardContent>
    </Card>
  );
}
