"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Play,
  Clock,
  Target,
  Loader2,
  Lightbulb,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { levelCalculation } from "@/lib/utils";
import {
  UserXpEarned,
  ActivityStatus,
  ActivityType,
} from "../models/user-activity-log-model";
import {
  useGameTimer,
  generateClozeBlanksSentence,
} from "./hooks/useGameActivity";
import { formatTime } from "./utils";
import GameResultScreen from "./game-result-screen";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ClozeTestData {
  id: string;
  articleId: string;
  articleTitle: string;
  sentence: string;
  words: Array<{ word: string; start: number; end: number }>;
  blanks: Array<{
    id: string;
    position: number;
    correctAnswer: string;
    options: string[];
    hint?: string;
  }>;
  audioUrl?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface UserAnswer {
  blankId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

type Props = {
  userId: string;
  articleId: string;
  onCompleteChange: (complete: boolean) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LessonClozeTest({ userId, articleId, onCompleteChange }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tUpdateScore = useScopedI18n("pages.student.practicePage.flashcardPractice");
  const router = useRouter();

  // ── Game state ────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set());

  // ── Activity completion tracking ──────────────────────────────────────────
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [isScoreSaved, setIsScoreSaved] = useState(false);
  const [activityLogData, setActivityLogData] = useState<any>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [rawSentenceData, setRawSentenceData] = useState<ClozeTestData[]>([]);
  const [activeSentences, setActiveSentences] = useState<ClozeTestData[]>([]);
  const [gameResults, setGameResults] = useState<
    Array<{ sentenceId: string; results: Array<{ blankId: string; correct: boolean; selectedAnswer: string; correctAnswer: string }> }>
  >([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  // ── Shared timer hook ─────────────────────────────────────────────────────
  const { displayTimer: timer } = useGameTimer(isPlaying, gameComplete);

  // ─────────────────────────────────────────────────────────────────────────
  // Data loading
  // ─────────────────────────────────────────────────────────────────────────

  const loadSentencesFromArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/users/sentences/${userId}/?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        const transformed: ClozeTestData[] = data.sentences.map((s: any, i: number) => {
          const words = s.sentence.split(" ").map((word: string, wi: number) => ({
            word: word.replace(/[^\w\s]/gi, ""),
            start: wi * 0.5,
            end: (wi + 1) * 0.5,
          }));
          return {
            id: `sentence-${i}`,
            articleId: s.articleId,
            articleTitle: `Sentence ${i + 1}`,
            sentence: s.sentence,
            words,
            blanks: [],
            audioUrl: s.audioUrl,
            difficulty: "medium" as const,
          };
        });
        setRawSentenceData(transformed);
      } else {
        toast({ title: "Error", description: "Failed to load sentences from lesson", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to load sentences", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const checkActivityCompletion = async () => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/activitylog?articleId=${articleId}&activityType=sentence_cloze_test`);
      if (res.ok) {
        const data = await res.json();
        const completed = data.activityLogs?.find((log: any) => log.completed === true);
        if (completed) {
          setActivityLogData(completed);
          setIsAlreadyCompleted(true);
          setIsScoreSaved(true);
          setGameComplete(true);
          onCompleteChange(true);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadSentencesFromArticle();
    checkActivityCompletion();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Blank generation (uses shared util)
  // ─────────────────────────────────────────────────────────────────────────

  const activeSentencesWithBlanks = useMemo(() => {
    if (rawSentenceData.length === 0) return [];
    return rawSentenceData.map((s) => generateClozeBlanksSentence(s, selectedDifficulty) as ClozeTestData);
  }, [rawSentenceData, selectedDifficulty]);

  useEffect(() => {
    setActiveSentences(activeSentencesWithBlanks);
    if (activeSentencesWithBlanks.length > 0) {
      setCurrentIndex(0);
      setUserAnswers([]);
      setShowResult(false);
      setIsCompleted(false);
      setHasUserInteracted(false);
      setShowCorrectAnswers(false);
    }
  }, [activeSentencesWithBlanks]);

  const currentSentence = useMemo(() => activeSentences[currentIndex], [activeSentences, currentIndex]);

  // Reset per-sentence state when sentence changes
  useEffect(() => {
    if (currentSentence) {
      setUserAnswers([]);
      setShowResult(false);
      setIsCompleted(false);
      setHasUserInteracted(false);
      setShowCorrectAnswers(false);
    }
  }, [currentSentence?.id]);

  // Auto-complete check when answers change
  useEffect(() => {
    if (!currentSentence || userAnswers.length === 0) return;
    if (userAnswers.length === currentSentence.blanks.length && !isCompleted && hasUserInteracted) {
      const correctCount = userAnswers.filter((a) => a.isCorrect).length;
      const isAllCorrect = correctCount === currentSentence.blanks.length;
      setIsCompleted(true);
      setShowResult(true);
      if (isAllCorrect && !completedSentences.has(currentIndex)) {
        setScore((prev) => prev + 1);
        setCompletedSentences((prev) => new Set([...prev, currentIndex]));
        toast({ title: t("toast.success"), description: "Perfect! All blanks filled correctly! 🎉" });
      } else {
        toast({ title: "Try Again", description: `${correctCount}/${currentSentence.blanks.length} correct. Try again! 💪`, variant: "destructive" });
      }
    }
  }, [userAnswers, currentSentence?.blanks.length, isCompleted, hasUserInteracted]);

  // Save game results when complete
  useEffect(() => {
    if (gameComplete && !isAlreadyCompleted && !isScoreSaved) saveGameResults();
  }, [gameComplete, isAlreadyCompleted, isScoreSaved]);

  const progress = useMemo(
    () => ((currentIndex + (isCompleted ? 1 : 0)) / (activeSentences.length || 1)) * 100,
    [currentIndex, isCompleted, activeSentences.length]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleAnswerSelect = useCallback(
    (blankId: string, selectedAnswer: string) => {
      if (isCompleted) return;
      const blank = currentSentence?.blanks.find((b) => b.id === blankId);
      if (!blank) return;
      const isCorrect = selectedAnswer === blank.correctAnswer;
      setUserAnswers((prev) => {
        const existing = prev.find((a) => a.blankId === blankId);
        const answer: UserAnswer = { blankId, selectedAnswer, isCorrect };
        return existing ? prev.map((a) => (a.blankId === blankId ? answer : a)) : [...prev, answer];
      });
      setHasUserInteracted(true);
    },
    [currentSentence?.blanks, isCompleted]
  );

  const handleRestart = useCallback(() => {
    if (completedSentences.has(currentIndex)) {
      setCompletedSentences((prev) => { const s = new Set(prev); s.delete(currentIndex); return s; });
      setScore((prev) => prev - 1);
    }
    setUserAnswers([]);
    setShowResult(false);
    setIsCompleted(false);
    setHasUserInteracted(false);
    setShowCorrectAnswers(false);
    setHintsEnabled(false);
    toast({ title: "Answers Reset", description: "All answers for this sentence have been cleared." });
  }, [currentIndex, completedSentences]);

  const handleCheckAnswer = useCallback(() => {
    if (!currentSentence || userAnswers.length === 0) return;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    setIsCompleted(true);
    setShowResult(true);
    if (correctCount === currentSentence.blanks.length && !completedSentences.has(currentIndex)) {
      setScore((prev) => prev + 1);
      setCompletedSentences((prev) => new Set([...prev, currentIndex]));
    }
  }, [currentSentence, userAnswers, completedSentences, currentIndex]);

  const saveSentenceResult = useCallback(async () => {
    if (!currentSentence || userAnswers.length === 0) return;
    const results = currentSentence.blanks.map((blank) => {
      const answer = userAnswers.find((a) => a.blankId === blank.id);
      return { blankId: blank.id, correct: answer?.isCorrect || false, selectedAnswer: answer?.selectedAnswer || "", correctAnswer: blank.correctAnswer };
    });
    setGameResults((prev) => [...prev, { sentenceId: currentSentence.id, results }]);
  }, [currentSentence, userAnswers]);

  const saveGameResults = useCallback(async () => {
    try {
      if (isAlreadyCompleted || isScoreSaved) return;
      setIsScoreSaved(true);
      const res = await fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        body: JSON.stringify({
          activityType: ActivityType.SentenceClozeTest,
          activityStatus: ActivityStatus.Completed,
          xpEarned: UserXpEarned.Sentence_Cloze_Test,
          articleId,
          details: {
            articleId,
            difficulty: selectedDifficulty,
            totalScore: score,
            totalQuestions: activeSentences.length,
            timeTaken: timer,
            cefr_level: levelCalculation(UserXpEarned.Sentence_Cloze_Test).cefrLevel,
          },
        }),
      });
      if (res?.status === 200) {
        router.refresh();
        toast({ title: t("toast.success"), imgSrc: true, description: tUpdateScore("yourXp", { xp: UserXpEarned.Sentence_Cloze_Test }) });
        onCompleteChange(true);
      }
    } catch (error) {
      console.error("Error saving game results:", error);
      setIsScoreSaved(false);
      toast({ title: t("toast.error"), description: t("toast.errorDescription"), variant: "destructive" });
    }
  }, [gameResults, timer, selectedDifficulty, isAlreadyCompleted, isScoreSaved, score, activeSentences.length, userId, articleId, router, t, tUpdateScore, onCompleteChange]);

  const handleNext = useCallback(async () => {
    if (currentSentence && userAnswers.length > 0 && isCompleted) await saveSentenceResult();
    if (currentIndex < activeSentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await saveGameResults();
      setGameComplete(true);
      setIsPlaying(false);
    }
  }, [saveSentenceResult, saveGameResults, currentSentence, userAnswers, isCompleted, currentIndex, activeSentences.length]);

  // Render sentence with dropdown blanks
  const renderSentenceWithBlanks = useCallback(() => {
    if (!currentSentence) return null;
    let sentence = currentSentence.sentence;
    currentSentence.blanks.forEach((blank) => {
      const blankElement = `<BLANK_${blank.id}>`;
      sentence = sentence.slice(0, blank.position) + blankElement + sentence.slice(blank.position + blank.correctAnswer.length);
    });
    const parts = sentence.split(/<BLANK_([^>]+)>/);
    return (
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => {
          if (index % 2 === 0) return <span key={index}>{part}</span>;
          const blankId = part;
          const blank = currentSentence.blanks.find((b) => b.id === blankId);
          const userAnswer = userAnswers.find((a) => a.blankId === blankId);
          if (!blank) return null;
          return (
            <span key={index} className="mx-1 inline-block">
              <Select value={userAnswer?.selectedAnswer || ""} onValueChange={(v) => handleAnswerSelect(blankId, v)} disabled={isCompleted}>
                <SelectTrigger className={cn("inline-flex h-8 w-auto min-w-[80px] px-3 py-1",
                  userAnswer?.isCorrect === true && hintsEnabled && "border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-400",
                  userAnswer?.isCorrect === false && hintsEnabled && "border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400"
                )}>
                  <SelectValue placeholder="___" />
                </SelectTrigger>
                <SelectContent>
                  {blank.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </span>
          );
        })}
      </div>
    );
  }, [currentSentence, userAnswers, isCompleted, hintsEnabled, handleAnswerSelect]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render branches
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loading your sentences...</h3>
            <p className="text-muted-foreground text-sm">Preparing cloze test from lesson sentences</p>
          </div>
        </div>
      </div>
    );
  }

  if ((gameComplete && !isAlreadyCompleted) || isAlreadyCompleted) {
    const apiData = activityLogData?.details;
    return (
      <GameResultScreen
        stats={{
          score: apiData?.totalScore ?? score,
          total: apiData?.totalQuestions ?? activeSentences.length,
          timeTaken: apiData?.timeTaken ?? timer,
          xpEarned: activityLogData?.xpEarned,
          title: apiData?.title,
          scoreLabel: "Perfect Scores",
          challengeLabel: "cloze test challenges",
        }}
      />
    );
  }

  if (!isPlaying) {
    return (
      <div className="mx-auto space-y-6">
        <Card className="mx-auto w-full">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            <p className="text-muted-foreground">Fill in the blanks in sentences from this lesson</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: <span className="text-primary text-2xl font-bold">{activeSentences.length}</span>, label: "Sentences", sub: "Ready to practice" },
                { icon: <Target className="h-6 w-6 text-green-600" />, label: "Fill Blanks", sub: `${selectedDifficulty === "easy" ? "1" : selectedDifficulty === "medium" ? "2" : "3"} blank(s) each` },
                { icon: <Clock className="h-6 w-6 text-purple-600" />, label: `~${selectedDifficulty === "easy" ? "5" : selectedDifficulty === "medium" ? "10" : "15"} min`, sub: "Estimated time" },
              ].map(({ icon, label, sub }, i) => (
                <div key={i} className="space-y-2 text-center">
                  <div className={`${i === 0 ? "bg-primary/10" : i === 1 ? "bg-green-500/10" : "bg-purple-500/10"} mx-auto flex h-12 w-12 items-center justify-center rounded-full`}>{icon}</div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-muted-foreground text-xs">{sub}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-4">
              <Label htmlFor="difficulty" className="text-sm font-medium">Choose Difficulty Level</Label>
              <Select value={selectedDifficulty} onValueChange={(v: "easy" | "medium" | "hard") => setSelectedDifficulty(v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  {[{ value: "easy", emoji: "🟢", color: "text-green-600" }, { value: "medium", emoji: "🟡", color: "text-yellow-600" }, { value: "hard", emoji: "🔴", color: "text-red-600" }].map(({ value, emoji, color }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2"><span className={color}>{emoji}</span><span className="capitalize">{value}</span></div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground text-sm">
                  {selectedDifficulty === "easy" && "Perfect for beginners. One word will be missing from each sentence."}
                  {selectedDifficulty === "medium" && "Moderate challenge. Two words will be missing from each sentence."}
                  {selectedDifficulty === "hard" && "Maximum challenge. Three words will be missing from each sentence."}
                </p>
              </div>
            </div>
            <Button onClick={() => setIsPlaying(true)} size="lg" className="h-12 w-full" disabled={activeSentences.length === 0}>
              <Play className="mr-2 h-5 w-5" />{activeSentences.length === 0 ? "No sentences available" : "Start Practice"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentSentence) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
        <p className="text-muted-foreground ml-3">Loading next challenge...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>{currentIndex + 1} of {activeSentences.length}</span>
          <div className="flex items-center gap-4">
            <span>{score}/{activeSentences.length} perfect</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(timer)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Game card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📖 {currentSentence.articleTitle}</CardTitle>
          <p className="text-muted-foreground text-sm">Fill in the missing words by selecting from the dropdown menus</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hints */}
          <div className="bg-muted/30 flex flex-wrap items-center gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500" /><span className="text-sm font-medium">Hints:</span></div>
            <Button onClick={() => setHintsEnabled((v) => !v)} variant={hintsEnabled ? "default" : "outline"} size="sm" className="h-8">
              {hintsEnabled ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
              {hintsEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Sentence with blanks */}
          <Card className="border-muted-foreground/25 bg-muted/10 border-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2"><Target className="text-primary h-5 w-5" /><p className="text-sm font-medium">Complete the sentence by filling in the blanks:</p></div>
                <div className="bg-card rounded-lg border p-4">{renderSentenceWithBlanks()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress: {userAnswers.length}/{currentSentence.blanks.length} blanks filled</span>
            {userAnswers.length > 0 && <span className="text-muted-foreground">Correct: {userAnswers.filter((a) => a.isCorrect).length}/{userAnswers.length}</span>}
          </div>

          {/* Result */}
          {showResult && (
            <Card className={cn("border-2", userAnswers.every((a) => a.isCorrect) ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20")}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {userAnswers.every((a) => a.isCorrect) ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                    <h3 className="text-lg font-semibold">
                      {userAnswers.every((a) => a.isCorrect) ? "Perfect! All blanks correct! 🎉" : `${userAnswers.filter((a) => a.isCorrect).length}/${currentSentence.blanks.length} correct 💪`}
                    </h3>
                  </div>
                  {!userAnswers.every((a) => a.isCorrect) && showCorrectAnswers && (
                    <div className="space-y-3">
                      <Separator />
                      <h4 className="mb-3 font-medium">Correct Answers:</h4>
                      <div className="space-y-2">
                        {currentSentence.blanks.map((blank, i) => (
                          <div key={blank.id} className="flex gap-3 text-sm">
                            <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                            <p className="flex-1"><span className="font-medium">{blank.correctAnswer}</span>{blank.hint && <span className="text-muted-foreground ml-2">({blank.hint})</span>}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleRestart} variant="outline" size="sm"><RotateCcw className="mr-2 h-4 w-4" />Reset Answers</Button>
            {!isCompleted && userAnswers.length > 0 && <Button onClick={handleCheckAnswer} variant="outline" size="sm"><CheckCircle className="mr-2 h-4 w-4" />Check Answers</Button>}
            {isCompleted && !userAnswers.every((a) => a.isCorrect) && !showCorrectAnswers && (
              <Button onClick={() => setShowCorrectAnswers(true)} variant="secondary" size="sm"><Eye className="mr-2 h-4 w-4" />Show Answers</Button>
            )}
            {isCompleted && (
              <Button onClick={handleNext} className="flex-1">
                {currentIndex < activeSentences.length - 1 ? "Next Sentence" : "Finish Practice"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
