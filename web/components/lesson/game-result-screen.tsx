"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Zap, Clock, RotateCcw } from "lucide-react";
import { formatTime } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GameResultStats {
  score: number;
  total: number;
  timeTaken: number;
  xpEarned?: number;
  difficulty?: string;
  title?: string;
  /** Override label for the "score" stat. Default: "Correct Answers" */
  scoreLabel?: string;
  /** Override label for the game type in the subtitle. Default: "challenges" */
  challengeLabel?: string;
}

interface GameResultScreenProps {
  stats: GameResultStats;
  onPlayAgain?: () => void;
  /** Extra content rendered below the stats grid */
  children?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared game-completion results screen used by:
 * - LessonClozeTest
 * - LessonOrderSentences
 * - LessonOrderWord
 *
 * Accepts stats and an optional "Play Again" callback.
 */
const GameResultScreen: React.FC<GameResultScreenProps> = ({
  stats,
  onPlayAgain,
  children,
}) => {
  const {
    score,
    total,
    timeTaken,
    xpEarned,
    title,
    scoreLabel = "Correct Answers",
    challengeLabel = "challenges",
  } = stats;

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <Card className="mx-auto w-full">
      <CardContent className="p-8">
        <div className="space-y-8 text-center">
          {/* Trophy */}
          <div className="relative">
            <div className="animate-bounce">
              <Trophy className="mx-auto h-24 w-24 text-yellow-500" />
            </div>
            <div className="bg-primary absolute -top-2 -right-2 h-6 w-6 animate-ping rounded-full" />
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="gradient-text text-4xl font-bold md:text-5xl">
              🎉 Fantastic Work!
            </h1>
            <p className="text-muted-foreground text-xl">
              You completed {total} {challengeLabel}
            </p>
            {title && (
              <p className="text-muted-foreground text-lg">📖 {title}</p>
            )}
          </div>

          {/* Stats grid */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
            <StatCard
              icon={<Target className="h-8 w-8 text-blue-500" />}
              value={score}
              label={scoreLabel}
              colorClass="text-blue-600"
            />
            <StatCard
              icon={<Zap className="h-8 w-8 text-green-500" />}
              value={`${accuracy}%`}
              label="Accuracy"
              colorClass="text-green-600"
            />
            <StatCard
              icon={<Clock className="h-8 w-8 text-purple-500" />}
              value={formatTime(timeTaken)}
              label="Time Taken"
              colorClass="text-purple-600"
            />
            {xpEarned !== undefined && (
              <StatCard
                icon={<Trophy className="h-8 w-8 text-orange-500" />}
                value={`+${xpEarned}`}
                label="XP Earned"
                colorClass="text-orange-600"
              />
            )}
          </div>

          {/* Performance badge */}
          <PerformanceBadge accuracy={accuracy} />

          {/* Play-again button */}
          {onPlayAgain && (
            <Button variant="outline" onClick={onPlayAgain} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
          )}

          {/* Extra content from parent */}
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  colorClass: string;
}> = ({ icon, value, label, colorClass }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6 text-center">
      <div className="mx-auto mb-3">{icon}</div>
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
      <p className="text-muted-foreground text-sm">{label}</p>
    </CardContent>
  </Card>
);

const PerformanceBadge: React.FC<{ accuracy: number }> = ({ accuracy }) => {
  if (accuracy === 100) {
    return (
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-lg">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6" />
            <span className="font-bold text-lg">Perfect Score! 🏆</span>
          </div>
        </div>
      </div>
    );
  }
  if (accuracy >= 80) {
    return (
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full shadow-lg">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6" />
            <span className="font-bold text-lg">Excellent Work! ⭐</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full shadow-lg">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6" />
          <span className="font-bold text-lg">Good Effort! 👍</span>
        </div>
      </div>
    </div>
  );
};

GameResultScreen.displayName = "GameResultScreen";
export default GameResultScreen;
