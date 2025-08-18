"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, Play, BarChart3, Calendar, Target } from "lucide-react";

interface DeckStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
}

interface DeckViewProps {
  userId: string;
  type: "vocabulary" | "sentences";
  stats: DeckStats;
  onStartGame: () => void;
  onStatsUpdate: (newStats: DeckStats) => void;
}

export default function DeckView({ userId, type, stats, onStartGame, onStatsUpdate }: DeckViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const isVocabulary = type === "vocabulary";
  
  useEffect(() => {
    fetchStats();
  }, [userId, type]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/flashcard/stats/${userId}?type=${type}`);
      const data = await response.json();
      
      if (response.ok) {
        // Calculate stats from the data
        const cards = isVocabulary ? data.vocabularies : data.sentences;
        const newStats = calculateStats(cards);
        onStatsUpdate(newStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (cards: any[]): DeckStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return cards.reduce((stats, card) => {
      stats.total++;
      
      const dueDate = new Date(card.due);
      const cardDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
      if (cardDate <= today) {
        stats.due++;
      }
      
      switch (card.state) {
        case 0: // New
          stats.new++;
          break;
        case 1: // Learning
        case 3: // Relearning
          stats.learning++;
          break;
        case 2: // Review
          stats.review++;
          break;
      }
      
      return stats;
    }, { total: 0, new: 0, learning: 0, review: 0, due: 0 });
  };

  const progressPercentage = stats.total > 0 ? ((stats.total - stats.due) / stats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Main Deck Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isVocabulary ? (
                <BookOpen className="h-8 w-8 text-blue-600" />
              ) : (
                <MessageSquare className="h-8 w-8 text-green-600" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {isVocabulary ? "Vocabulary Cards" : "Sentence Cards"}
                </CardTitle>
                <CardDescription>
                  {stats.total} cards • {stats.due} due today
                </CardDescription>
              </div>
            </div>
            
            <Button 
              onClick={onStartGame}
              disabled={stats.due === 0}
              size="lg"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Study Now
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.new}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                New
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.learning}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Learning
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.review}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                Review
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.due}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                Due
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onStartGame}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Study Due Cards</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Review cards that are due for study today
            </p>
            <Badge variant={stats.due > 0 ? "destructive" : "secondary"}>
              {stats.due} due
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Study New Cards</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Learn new cards that haven&apos;t been studied yet
            </p>
            <Badge variant={stats.new > 0 ? "default" : "secondary"}>
              {stats.new} new
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Free Study</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Study any cards without scheduling constraints
            </p>
            <Badge variant="outline">
              {stats.total} total
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
