"use client";

import React from "react";
import { Trophy, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HUDProps {
  score: number;
  accuracy: number;
}

export function HUD({ score, accuracy }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between z-20 pointer-events-none">
      {/* Left: Score */}
      <div className="min-w-[140px] rounded-2xl border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 mb-0.5">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            Score
          </div>
        </div>
        <div className="text-2xl font-bold text-white leading-none">
          {score}
        </div>
      </div>

      {/* Center: Title/Status (Optional, or could be a combo meter) */}
      <div className="mt-2 text-white/40 text-sm font-medium uppercase tracking-[0.3em] bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm border border-white/5">
        Magic Defense
      </div>

      {/* Right: Accuracy */}
      <div className="min-w-[140px] rounded-2xl border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-md shadow-lg text-right">
        <div className="flex items-center justify-end gap-2 mb-0.5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            Accuracy
          </div>
          <Target className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-white leading-none">
          {Math.round(accuracy * 100)}%
        </div>
      </div>
    </div>
  );
}
