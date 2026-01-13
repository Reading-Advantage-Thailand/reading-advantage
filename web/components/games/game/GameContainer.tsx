"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import { StartScreen } from "./StartScreen";
import { GameEngine } from "./GameEngine";
import { ResultsScreen } from "./ResultsScreen";
import { calculateXP } from "@/lib/games/xp";

interface GameContainerProps {
  onComplete?: (results: {
    score: number;
    correctAnswers: number;
    totalAttempts: number;
    accuracy: number;
  }) => void;
}

export function GameContainer({ onComplete }: GameContainerProps) {
  const {
    status,
    vocabulary,
    score,
    correctAnswers,
    totalAttempts,
    resetGame,
  } = useGameStore();

  const accuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;
  const xp = calculateXP(score, correctAnswers, totalAttempts);

  React.useEffect(() => {
    if (status === "game-over" && onComplete) {
      onComplete({
        score,
        correctAnswers,
        totalAttempts,
        accuracy,
      });
    }
  }, [status, onComplete, score, correctAnswers, totalAttempts, accuracy]);

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[600px] overflow-hidden rounded-3xl border border-purple-500/20 bg-slate-900/40 backdrop-blur-md shadow-[0_0_40px_rgba(168,85,247,0.15)] ring-1 ring-white/10">
      {status === "idle" && (
        <StartScreen vocabulary={vocabulary} onStart={resetGame} />
      )}

      {status === "playing" && <GameEngine />}

      {status === "game-over" && (
        <ResultsScreen
          score={score}
          accuracy={accuracy}
          xp={xp}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
