"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  GripVertical,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Shuffle,
  Target,
  Volume2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { levelCalculation } from "@/lib/utils";
import { UserXpEarned, ActivityStatus, ActivityType } from "../models/user-activity-log-model";
import "animate.css";
import { AUDIO_URL } from "@/server/constants";
import { useGameTimer, shuffleArray } from "./hooks/useGameActivity";
import { formatTime } from "./utils";
import GameResultScreen from "./game-result-screen";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OrderSentenceData {
  id: string;
  articleId: string;
  articleTitle: string;
  correctOrder: string[];
  sentences: Array<{
    id: string;
    text: string;
    originalIndex: number;
    audioUrl?: string;
    startTime?: number;
    endTime?: number;
  }>;
  difficulty: "easy" | "medium" | "hard";
  startIndex: number;
}

interface DraggableSentence {
  id: string;
  text: string;
  originalIndex: number;
  audioUrl?: string;
  startTime?: number;
  endTime?: number;
}

type Props = {
  userId: string;
  articleId: string;
  onCompleteChange: (complete: boolean) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default React.memo(function LessonOrderSentences({ userId, articleId, onCompleteChange }: Props) {
  const { toast } = useToast();

  // ── Game state ────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userOrder, setUserOrder] = useState<DraggableSentence[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSentences, setActiveSentences] = useState<OrderSentenceData[]>([]);
  const [sentenceResults, setSentenceResults] = useState<Array<{ sentenceId: string; isCorrect: boolean }>>([]);
  const [completedActivityData, setCompletedActivityData] = useState<any>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showCorrectOrder, setShowCorrectOrder] = useState(false);
  const [highlightHintsEnabled, setHighlightHintsEnabled] = useState(false);
  const [audioHintsEnabled, setAudioHintsEnabled] = useState(false);
  const [isPlayingHintAudio, setIsPlayingHintAudio] = useState(false);

  // ── Drag state ────────────────────────────────────────────────────────────
  const [draggedItem, setDraggedItem] = useState<DraggableSentence | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Shared timer hook ─────────────────────────────────────────────────────
  const { timerRef, displayTimer } = useGameTimer(isPlaying, gameComplete);

  // ─────────────────────────────────────────────────────────────────────────
  // Data loading
  // ─────────────────────────────────────────────────────────────────────────

  const checkExistingActivity = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/activitylog?articleId=${articleId}&activityType=sentence_ordering`);
      if (res.ok) {
        const data = await res.json();
        const existing = data.activityLogs?.find(
          (a: any) => a.activityType === "sentence_ordering" && a.targetId === articleId && a.completed
        );
        if (existing) {
          setIsCompleted(true);
          setGameComplete(true);
          setCompletedActivityData(existing);
          onCompleteChange(true);
          return true;
        }
      }
    } catch {}
    return false;
  }, [userId, articleId, onCompleteChange]);

  const loadSentencesFromArticle = useCallback(async () => {
    setIsLoading(true);
    try {
      const activityExists = await checkExistingActivity();
      if (activityExists) { setIsLoading(false); return; }

      const res = await fetch(`/api/v1/articles/${articleId}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const timepoints = data.article.timepoints || [];
      if (timepoints.length < 5) {
        toast({ title: "Error", description: "Not enough sentences available for ordering", variant: "destructive" });
        return;
      }

      const maxGroups = Math.min(3, timepoints.length - 4);
      const groups: OrderSentenceData[] = [];
      for (let i = 0; i < maxGroups; i++) {
        const startIndex = Math.floor(Math.random() * (timepoints.length - 4));
        const selected = timepoints.slice(startIndex, startIndex + 5);
        groups.push({
          id: `group-${i}-${Date.now()}`,
          articleId,
          articleTitle: data.article.title,
          correctOrder: selected.map((tp: any) => tp.sentences),
          sentences: selected.map((tp: any, idx: number) => ({
            id: `sentence-${tp.index}-${Date.now()}-${idx}`,
            text: tp.sentences,
            originalIndex: tp.index,
            audioUrl: `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/${AUDIO_URL}/${tp.file}`,
            startTime: tp.timeSeconds,
            endTime: idx < 4 ? selected[idx + 1].timeSeconds : (timepoints[startIndex + 5]?.timeSeconds ? timepoints[startIndex + 5].timeSeconds - 0.5 : tp.timeSeconds + 4),
          })),
          difficulty: "medium" as const,
          startIndex,
        });
      }
      setActiveSentences(groups);
    } catch {
      toast({ title: "Error", description: "Failed to load sentences", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [articleId, checkExistingActivity, toast]);

  useEffect(() => {
    if (userId && articleId) loadSentencesFromArticle();
  }, [userId, articleId]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Computed values
  // ─────────────────────────────────────────────────────────────────────────

  const currentSentenceGroup = useMemo(() => activeSentences[currentIndex], [activeSentences, currentIndex]);

  const shuffleSentences = useCallback((sentences: typeof currentSentenceGroup.sentences) => {
    const shuffled = shuffleArray([...sentences]);
    return shuffled.map((sentence, index) => ({
      id: `${sentence.id}-shuffled-${Date.now()}-${index}`,
      text: sentence.text,
      originalIndex: sentences.findIndex((s) => s.id === sentence.id),
      audioUrl: sentence.audioUrl,
      startTime: sentence.startTime,
      endTime: sentence.endTime,
    }));
  }, []);

  // Initialize shuffled sentences when sentence group changes
  useEffect(() => {
    if (currentSentenceGroup?.sentences) {
      setUserOrder(shuffleSentences(currentSentenceGroup.sentences));
      setShowResult(false);
      setIsCompleted(false);
      setHasUserInteracted(false);
      setShowCorrectOrder(false);
    }
  }, [currentSentenceGroup?.id, shuffleSentences]);

  // Auto-check when order changes
  useEffect(() => {
    if (!currentSentenceGroup?.correctOrder || userOrder.length === 0) return;
    if (userOrder.length === currentSentenceGroup.sentences.length && !isCompleted && hasUserInteracted) {
      const userSentenceOrder = userOrder.map((item) => item.text);
      const isCorrect = JSON.stringify(userSentenceOrder) === JSON.stringify(currentSentenceGroup.correctOrder);
      if (isCorrect) {
        setIsCompleted(true);
        setShowResult(true);
        setScore((prev) => prev + 1);
        setSentenceResults((prev) => [...prev, { sentenceId: currentSentenceGroup.id, isCorrect: true }]);
        toast({ title: "Perfect!", description: "Correct sentence order! 🎉" });
      }
    }
  }, [userOrder, currentSentenceGroup?.correctOrder, currentSentenceGroup?.id, isCompleted, hasUserInteracted]);

  const progress = useMemo(
    () => ((currentIndex + (isCompleted ? 1 : 0)) / (activeSentences.length || 1)) * 100,
    [currentIndex, isCompleted, activeSentences.length]
  );

  const isCurrentOrderCorrect = useMemo(() => {
    const userSentenceOrder = userOrder.map((item) => item.text);
    return JSON.stringify(userSentenceOrder) === JSON.stringify(currentSentenceGroup?.correctOrder || []);
  }, [userOrder, currentSentenceGroup?.correctOrder]);

  const isInCorrectPosition = useCallback(
    (sentence: DraggableSentence, pos: number) => {
      if (!currentSentenceGroup?.correctOrder || !highlightHintsEnabled) return false;
      return currentSentenceGroup.correctOrder[pos] === sentence.text;
    },
    [currentSentenceGroup?.correctOrder, highlightHintsEnabled]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Drag handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, item: DraggableSentence) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    const dragIndex = userOrder.findIndex((item) => item.id === draggedItem.id);
    if (dragIndex === dropIndex) { setDragOverIndex(null); return; }
    const newOrder = [...userOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    setUserOrder(newOrder);
    setDraggedItem(null);
    setDragOverIndex(null);
    setHasUserInteracted(true);
  }, [draggedItem, userOrder]);

  const handleDragEnd = useCallback(() => { setDraggedItem(null); setDragOverIndex(null); }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Game action handlers
  // ─────────────────────────────────────────────────────────────────────────

  const saveGameResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          activityType: ActivityType.SentenceOrdering,
          activityStatus: ActivityStatus.Completed,
          xpEarned: UserXpEarned.Sentence_Ordering,
          timeTaken: timerRef.current,
          details: {
            cefr_level: levelCalculation(UserXpEarned.Sentence_Ordering).cefrLevel,
            totalQuestions: activeSentences.length,
            correctAnswers: score,
            sentenceResults,
          },
        }),
      });
      if (res.ok) toast({ title: "Great Job!", description: `You earned ${UserXpEarned.Sentence_Ordering} XP! 🎉` });
    } catch {}
  }, [userId, articleId, activeSentences.length, score, sentenceResults, timerRef]);

  const handleNext = useCallback(async () => {
    if (!isCompleted && currentSentenceGroup) {
      setSentenceResults((prev) => [...prev, { sentenceId: currentSentenceGroup.id, isCorrect: false }]);
    }
    if (currentIndex < activeSentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await saveGameResults();
      setGameComplete(true);
      setIsPlaying(false);
      onCompleteChange(true);
    }
  }, [currentIndex, activeSentences.length, isCompleted, currentSentenceGroup, saveGameResults, onCompleteChange]);

  const handleCheckAnswer = useCallback(() => {
    if (!currentSentenceGroup?.correctOrder || userOrder.length === 0) return;
    const correct = isCurrentOrderCorrect;
    setIsCompleted(true);
    setShowResult(true);
    setHasUserInteracted(true);
    if (correct) {
      setScore((prev) => prev + 1);
      setSentenceResults((prev) => [...prev, { sentenceId: currentSentenceGroup.id, isCorrect: true }]);
      toast({ title: "Perfect!", description: "Correct sentence order! 🎉" });
    } else {
      setSentenceResults((prev) => [...prev, { sentenceId: currentSentenceGroup.id, isCorrect: false }]);
      toast({ title: "Not quite right", description: "Try again! 💪", variant: "destructive" });
    }
  }, [userOrder, currentSentenceGroup, isCurrentOrderCorrect]);

  const handleRestart = useCallback(() => {
    if (currentSentenceGroup?.sentences) {
      setUserOrder(shuffleSentences(currentSentenceGroup.sentences));
      setShowResult(false);
      setIsCompleted(false);
      setHasUserInteracted(false);
      setShowCorrectOrder(false);
      setHighlightHintsEnabled(false);
      setAudioHintsEnabled(false);
      if (score > 0) setScore((prev) => prev - 1);
    }
  }, [currentSentenceGroup?.sentences, shuffleSentences, score]);

  // ── Audio hint playback ────────────────────────────────────────────────────
  const playHintAudio = useCallback(async () => {
    if (!currentSentenceGroup?.sentences || isPlayingHintAudio || !audioRef.current) return;
    setIsPlayingHintAudio(true);
    toast({ title: "Playing audio", description: "Playing sentences in correct order 🔊" });
    const audio = audioRef.current;
    const orderedSentences = currentSentenceGroup.correctOrder
      .map((text) => currentSentenceGroup.sentences.find((s) => s.text === text))
      .filter(Boolean) as typeof currentSentenceGroup.sentences;

    try {
      for (let i = 0; i < orderedSentences.length; i++) {
        const s = orderedSentences[i];
        if (!s?.audioUrl || s.startTime === undefined) continue;
        await new Promise<void>((resolve) => {
          const maxDuration = s.endTime ? s.endTime - s.startTime! : 5;
          const timeout = setTimeout(() => { audio.pause(); resolve(); }, (maxDuration + 1) * 1000);
          const onCanPlay = () => {
            audio.currentTime = s.startTime!;
            const onTimeUpdate = () => {
              if (audio.currentTime >= (s.endTime || s.startTime! + maxDuration)) {
                audio.pause();
                audio.removeEventListener("timeupdate", onTimeUpdate);
                clearTimeout(timeout);
                resolve();
              }
            };
            audio.addEventListener("timeupdate", onTimeUpdate);
            audio.play().catch(() => { clearTimeout(timeout); resolve(); });
          };
          audio.removeEventListener("canplaythrough", onCanPlay);
          audio.addEventListener("canplaythrough", onCanPlay, { once: true });
          audio.src = s.audioUrl!;
          audio.load();
        });
        if (i < orderedSentences.length - 1) await new Promise((r) => setTimeout(r, 500));
      }
      toast({ title: "Audio completed", description: "Correct order audio sequence completed! 🎵" });
    } catch {
      toast({ title: "Error", description: "Failed to play hint audio", variant: "destructive" });
    } finally {
      setIsPlayingHintAudio(false);
    }
  }, [currentSentenceGroup, isPlayingHintAudio, toast]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render branches
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 mt-4">
        <div className="grid w-full gap-10">
          <div className="mx-auto w-full px-16 xl:h-[400px] md:w-[725px] xl:w-[710px] space-y-6 mt-5">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[20px] w-2/3" />
            <Skeleton className="h-[20px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    const actData = completedActivityData?.details;
    return (
      <div className="flex flex-col items-center justify-center space-y-4 mt-4">
        <GameResultScreen
          stats={{
            score: actData?.correctAnswers ?? score,
            total: actData?.totalQuestions ?? activeSentences.length,
            timeTaken: completedActivityData?.timeTaken ?? displayTimer,
            xpEarned: completedActivityData?.xpEarned ?? UserXpEarned.Sentence_Ordering,
            title: actData?.title,
            scoreLabel: "Correct Orders",
            challengeLabel: "sentence groups",
          }}
        />
      </div>
    );
  }

  if (!isPlaying && activeSentences.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 mt-4">
        <Card className="w-full">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            <p className="text-muted-foreground">Arrange sentences in the correct chronological order</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              {[
                { count: activeSentences.length, label: "Sentence Groups", sub: "Ready to order" },
                { icon: <GripVertical className="h-6 w-6 text-green-600" />, label: "Drag & Drop", sub: "Easy interaction", color: "bg-green-500/10" },
                { icon: <Clock className="h-6 w-6 text-purple-600" />, label: "~5 min", sub: "Estimated time", color: "bg-purple-500/10" },
              ].map((item, i) => (
                <div key={i} className="space-y-2 text-center">
                  <div className={`${"color" in item ? item.color : "bg-primary/10"} mx-auto flex h-12 w-12 items-center justify-center rounded-full`}>
                    {"count" in item ? <span className="text-lg font-bold">{item.count}</span> : item.icon}
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-xs">{item.sub}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="bg-muted/50 space-y-3 rounded-lg p-6">
              <div className="flex items-center gap-2"><div className="bg-primary h-2 w-2 rounded-full" /><p className="text-sm font-medium">Instructions</p></div>
              <ul className="text-muted-foreground ml-4 space-y-2 text-sm">
                <li>• Drag and drop sentences to arrange them in chronological order</li>
                <li>• Use hint features if you need help</li>
                <li>• Complete all sentence groups to finish this phase</li>
              </ul>
            </div>
            <Button onClick={() => setIsPlaying(true)} size="lg" className="h-12 w-full">
              <Play className="mr-2 h-5 w-5" />Start Game!
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && activeSentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 mt-4">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No sentences available</h3>
            <p className="text-muted-foreground mb-4">Unable to load sentences for this article. Please try again.</p>
            <Button onClick={() => loadSentencesFromArticle()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentSentenceGroup) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
        <p className="text-muted-foreground ml-3">Loading next challenge...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 mt-4">
      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Progress */}
      <div className="w-full max-w-4xl space-y-2">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>{currentIndex + 1} of {activeSentences.length}</span>
          <div className="flex items-center gap-4">
            <span>{score}/{activeSentences.length} correct</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(displayTimer)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Game card */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">📖 {currentSentenceGroup?.articleTitle}</CardTitle>
          <p className="text-muted-foreground text-sm">Arrange these 5 sentences in chronological order</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hints */}
          <div className="bg-muted/30 flex flex-wrap items-center gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500" /><span className="text-sm font-medium">Hints:</span></div>
            <Button onClick={() => setHighlightHintsEnabled((v) => !v)} variant={highlightHintsEnabled ? "default" : "outline"} size="sm" className="h-8">
              <Target className="mr-1 h-3 w-3" />Highlight
            </Button>
            <Button onClick={() => setAudioHintsEnabled((v) => !v)} variant={audioHintsEnabled ? "default" : "outline"} size="sm" className="h-8">
              <Volume2 className="mr-1 h-3 w-3" />Audio
            </Button>
            {audioHintsEnabled && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <Button onClick={playHintAudio} disabled={isPlayingHintAudio} size="sm" className="h-8" variant="secondary">
                  {isPlayingHintAudio ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Play className="mr-1 h-3 w-3" />}
                  {isPlayingHintAudio ? "Playing..." : "Play Order"}
                </Button>
              </>
            )}
          </div>

          {/* Drag area */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground h-4 w-4" />
              <p className="text-sm font-medium">Drag to reorder sentences{hasUserInteracted && !isCompleted && " - Order and click Check Answer"}</p>
            </div>
            <div className="border-muted-foreground/25 bg-muted/30 min-h-[400px] rounded-lg border-2 border-dashed p-4">
              {userOrder.length === 0 ? (
                <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  {userOrder.map((sentence, index) => (
                    <div
                      key={sentence.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, sentence)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group relative cursor-move rounded-lg border-2 border-dashed p-4 transition-all duration-200",
                        "hover:border-primary/50 hover:bg-primary/5",
                        dragOverIndex === index && "border-primary bg-primary/10",
                        isInCorrectPosition(sentence, index) && "border-green-500 bg-green-50 dark:bg-green-950/20",
                        showCorrectOrder && currentSentenceGroup.correctOrder[index] === sentence.text && "border-green-500 bg-green-100 dark:bg-green-900/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">{index + 1}</div>
                        <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100" />
                        <p className="flex-1 text-sm leading-relaxed">{sentence.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          {showResult && (
            <Card className={cn("border-2", isCurrentOrderCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20")}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  {isCurrentOrderCorrect ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                  <div>
                    <h3 className="font-semibold">{isCurrentOrderCorrect ? "Perfect! 🎉" : "Not quite right"}</h3>
                    <p className="text-muted-foreground text-sm">{isCurrentOrderCorrect ? "You got the correct sentence order!" : "The sentences are not in the right order. Try again!"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleRestart} variant="outline" size="sm" disabled={score === activeSentences.length && !showCorrectOrder}>
              {showCorrectOrder || isCompleted ? <RotateCcw className="mr-2 h-4 w-4" /> : <Shuffle className="mr-2 h-4 w-4" />}
              {showCorrectOrder || isCompleted ? "Play Again" : "Shuffle Again"}
            </Button>
            {!isCompleted && <Button onClick={handleCheckAnswer} variant="outline" size="sm"><CheckCircle className="mr-2 h-4 w-4" />Check Answer</Button>}
            {isCompleted && !isCurrentOrderCorrect && !showCorrectOrder && (
              <Button onClick={() => { setShowCorrectOrder(true); toast({ title: "Answer revealed", description: "Correct order revealed! 📖" }); }} variant="secondary" size="sm">
                <XCircle className="mr-2 h-4 w-4" />Show Answer
              </Button>
            )}
            {isCompleted && (
              <Button onClick={handleNext} className="flex-1">
                {currentIndex < activeSentences.length - 1 ? "Next Sentence Order" : "Complete Practice"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
