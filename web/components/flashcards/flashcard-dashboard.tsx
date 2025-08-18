"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, BarChart3, Clock } from "lucide-react";
import FlashcardGame from "./flashcard-game";
import DeckView from "./deck-view";
import EmptyDeck from "./empty-deck";

interface FlashcardDashboardProps {
  userId: string;
}

interface DeckStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
}

interface FlashcardStats {
  vocabulary: DeckStats;
  sentences: DeckStats;
}

export default function FlashcardDashboard({
  userId,
}: FlashcardDashboardProps) {
  const [activeTab, setActiveTab] = useState<"vocabulary" | "sentences">(
    "vocabulary"
  );
  const [gameMode, setGameMode] = useState(false);
  const [deckStats, setDeckStats] = useState<FlashcardStats>({
    vocabulary: { total: 0, new: 0, learning: 0, review: 0, due: 0 },
    sentences: { total: 0, new: 0, learning: 0, review: 0, due: 0 },
  });

  useEffect(() => {
    // Fetch initial stats for both decks
    fetchAllStats();
  }, [userId]);

  const fetchAllStats = async () => {
    try {
      const response = await fetch(`/api/v1/flashcard/stats/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setDeckStats({
          vocabulary: data.vocabularyStats || {
            total: 0,
            new: 0,
            learning: 0,
            review: 0,
            due: 0,
          },
          sentences: data.sentenceStats || {
            total: 0,
            new: 0,
            learning: 0,
            review: 0,
            due: 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleStartGame = (type: "vocabulary" | "sentences") => {
    setActiveTab(type);
    setGameMode(true);
  };

  const handleExitGame = () => {
    setGameMode(false);
  };

  const currentStats = deckStats[activeTab];

  if (gameMode) {
    return (
      <FlashcardGame userId={userId} type={activeTab} onExit={handleExitGame} />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Flashcard Dashboard</h1>
        <p className="text-muted-foreground">
          Review your vocabulary and sentences with spaced repetition
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deckStats.vocabulary.total + deckStats.sentences.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {deckStats.vocabulary.due + deckStats.sentences.due}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Cards</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {deckStats.vocabulary.new + deckStats.sentences.new}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deckStats.vocabulary.learning + deckStats.sentences.learning}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deck Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "vocabulary" | "sentences")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary
            {deckStats.vocabulary.due > 0 && (
              <Badge variant="destructive" className="ml-1">
                {deckStats.vocabulary.due}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sentences" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Sentences
            {deckStats.sentences.due > 0 && (
              <Badge variant="destructive" className="ml-1">
                {deckStats.sentences.due}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="mt-6">
          {deckStats.vocabulary.total > 0 ? (
            <DeckView
              userId={userId}
              type="vocabulary"
              stats={deckStats.vocabulary}
              onStartGame={() => handleStartGame("vocabulary")}
              onStatsUpdate={(newStats: DeckStats) =>
                setDeckStats((prev) => ({ ...prev, vocabulary: newStats }))
              }
            />
          ) : (
            <EmptyDeck type="vocabulary" />
          )}
        </TabsContent>

        <TabsContent value="sentences" className="mt-6">
          {deckStats.sentences.total > 0 ? (
            <DeckView
              userId={userId}
              type="sentences"
              stats={deckStats.sentences}
              onStartGame={() => handleStartGame("sentences")}
              onStatsUpdate={(newStats: DeckStats) =>
                setDeckStats((prev) => ({ ...prev, sentences: newStats }))
              }
            />
          ) : (
            <EmptyDeck type="sentences" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
