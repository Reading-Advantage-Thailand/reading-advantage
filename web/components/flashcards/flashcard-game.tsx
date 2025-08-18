"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { 
  X, 
  Volume2, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  EyeOff,
  CheckCircle,
  Target 
} from "lucide-react";
import { useCurrentLocale } from "@/locales/client";
import { fsrs, generatorParameters, State, Rating } from "ts-fsrs";

interface FlashcardGameProps {
  userId: string;
  type: "vocabulary" | "sentences";
  onExit: () => void;
}

interface FlashcardData {
  id: string;
  // Vocabulary specific
  word?: {
    vocabulary: string;
    definition: {
      en: string;
      th: string;
      cn: string;
      tw: string;
      vi: string;
    };
    audioUrl?: string;
    startTime?: number;
    endTime?: number;
  };
  // Sentence specific
  sentence?: string;
  translation?: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
  audioUrl?: string;
  timepoint?: number;
  endTimepoint?: number;
  // FSRS fields
  difficulty: number;
  due: string;
  elapsedDays: number;
  lapses: number;
  reps: number;
  scheduledDays: number;
  stability: number;
  state: number;
  articleId: string;
}

export default function FlashcardGame({ userId, type, onExit }: FlashcardGameProps) {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studying, setStudying] = useState(false);
  const [completed, setCompleted] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";
  const isVocabulary = type === "vocabulary";
  const currentCard = cards[currentIndex];

  useEffect(() => {
    fetchDueCards();
  }, [userId, type]);

  const fetchDueCards = async () => {
    setLoading(true);
    try {
      const endpoint = isVocabulary 
        ? `/api/v1/flashcard/vocabularies/${userId}`
        : `/api/v1/flashcard/sentences/${userId}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        const allCards = isVocabulary ? data.vocabularies : data.sentences;
        
        // Filter due cards
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const dueCards = allCards.filter((card: FlashcardData) => {
          const dueDate = new Date(card.due);
          const cardDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          return cardDate <= today;
        });
        
        // Shuffle cards
        const shuffled = dueCards.sort(() => Math.random() - 0.5);
        setCards(shuffled);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Error",
        description: "Failed to load flashcards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!currentCard) return;
    
    let audioUrl = '';
    let startTime = 0;
    let endTime = 0;
    
    if (isVocabulary && currentCard.word?.audioUrl) {
      audioUrl = currentCard.word.audioUrl;
      startTime = currentCard.word.startTime || 0;
      endTime = currentCard.word.endTime || 0;
    } else if (!isVocabulary && currentCard.audioUrl) {
      audioUrl = currentCard.audioUrl;
      startTime = currentCard.timepoint || 0;
      endTime = currentCard.endTimepoint || 0;
    }
    
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      
      if (endTime > startTime) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }, (endTime - startTime) * 1000);
      }
    }
  };

  const handleRating = async (rating: Rating) => {
    if (!currentCard || studying) return;
    
    setStudying(true);
    
    try {
      // Calculate next review using FSRS
      const f = fsrs(generatorParameters());
      const now = new Date();
      
      // Create card object from current card data
      const cardObj = {
        due: new Date(currentCard.due),
        stability: currentCard.stability,
        difficulty: currentCard.difficulty,
        elapsed_days: currentCard.elapsedDays,
        scheduled_days: currentCard.scheduledDays,
        reps: currentCard.reps,
        lapses: currentCard.lapses,
        state: currentCard.state as State,
        last_review: new Date()
      };
      
      const schedulingInfo = f.repeat(cardObj, now);
      
      // Get the correct schedule based on rating
      let selectedSchedule;
      switch (rating) {
        case Rating.Again:
          selectedSchedule = schedulingInfo[Rating.Again];
          break;
        case Rating.Hard:
          selectedSchedule = schedulingInfo[Rating.Hard];
          break;
        case Rating.Good:
          selectedSchedule = schedulingInfo[Rating.Good];
          break;
        case Rating.Easy:
          selectedSchedule = schedulingInfo[Rating.Easy];
          break;
        default:
          selectedSchedule = schedulingInfo[Rating.Good];
      }
      
      // Update card data
      const updateData = {
        difficulty: selectedSchedule.card.difficulty,
        due: selectedSchedule.card.due,
        elapsed_days: selectedSchedule.card.elapsed_days,
        lapses: selectedSchedule.card.lapses,
        reps: selectedSchedule.card.reps,
        scheduled_days: selectedSchedule.card.scheduled_days,
        stability: selectedSchedule.card.stability,
        state: selectedSchedule.card.state,
        update_score: true
      };
      
      // Send update to server
      const response = await fetch(`/api/v1/flashcard/progress/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          rating,
          type: type
        })
      });
      
      if (response.ok) {
        setCompleted(prev => prev + 1);
        nextCard();
        
        // Show feedback
        const feedbackMessages = {
          [Rating.Again]: { title: "Try Again", message: "Don't worry, keep practicing!", variant: "destructive" as const },
          [Rating.Hard]: { title: "Hard", message: "You'll see this card again soon", variant: "default" as const },
          [Rating.Good]: { title: "Good", message: "Nice work! Card scheduled for review", variant: "default" as const },
          [Rating.Easy]: { title: "Easy", message: "Great! You won't see this for a while", variant: "default" as const }
        };
        
        const feedback = feedbackMessages[rating as keyof typeof feedbackMessages];
        if (feedback) {
          toast(feedback);
        }
      }
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Error",
        description: "Failed to update card progress",
        variant: "destructive",
      });
    } finally {
      setStudying(false);
    }
  };

  const nextCard = () => {
    setIsRevealed(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Study session complete
      toast({
        title: "Session Complete!",
        description: `You studied ${completed} cards today.`,
      });
      onExit();
    }
  };

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center p-8">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Done!</h2>
          <p className="text-muted-foreground mb-4">
            No cards are due for study right now. Great job!
          </p>
          <Button onClick={onExit}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <audio ref={audioRef} />
      
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onExit}>
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {isVocabulary ? "Vocabulary" : "Sentences"} Study
                </span>
                <Badge variant="secondary">
                  {currentIndex + 1} / {cards.length}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Completed: {completed}</span>
            </div>
          </div>
          
          <Progress value={progress} className="mt-3" />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-2xl">
          <Card 
            className={`min-h-[400px] cursor-pointer transform transition-transform hover:scale-[1.02] ${
              isRevealed ? 'bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950' : ''
            }`}
            onClick={toggleReveal}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
              {/* Front Side */}
              {!isRevealed && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
                    {isRevealed ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    Click to reveal
                  </div>
                  
                  <div className="text-3xl font-bold">
                    {isVocabulary 
                      ? currentCard?.word?.vocabulary 
                      : currentCard?.sentence
                    }
                  </div>
                  
                  {/* Audio Button */}
                  {((isVocabulary && currentCard?.word?.audioUrl) || (!isVocabulary && currentCard?.audioUrl)) && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      className="gap-2"
                    >
                      <Volume2 className="h-5 w-5" />
                      Play Audio
                    </Button>
                  )}
                </div>
              )}

              {/* Back Side */}
              {isRevealed && (
                <div className="space-y-6 w-full">
                  <div className="text-2xl font-bold">
                    {isVocabulary 
                      ? currentCard?.word?.vocabulary 
                      : currentCard?.sentence
                    }
                  </div>
                  
                  <div className="text-xl text-muted-foreground border-t pt-4">
                    {isVocabulary 
                      ? currentCard?.word?.definition[currentLocale] || currentCard?.word?.definition.en
                      : currentCard?.translation?.[currentLocale] || currentCard?.translation?.en
                    }
                  </div>
                  
                  {/* Rating Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
                    <Button 
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating(Rating.Again);
                      }}
                      disabled={studying}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Again
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating(Rating.Hard);
                      }}
                      disabled={studying}
                      className="gap-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Hard
                    </Button>
                    
                    <Button 
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating(Rating.Good);
                      }}
                      disabled={studying}
                      className="gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Good
                    </Button>
                    
                    <Button 
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating(Rating.Easy);
                      }}
                      disabled={studying}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Easy
                    </Button>
                  </div>
                  
                  {/* Audio Button */}
                  {((isVocabulary && currentCard?.word?.audioUrl) || (!isVocabulary && currentCard?.audioUrl)) && (
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      className="gap-2 mt-4"
                    >
                      <Volume2 className="h-5 w-5" />
                      Play Audio
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
