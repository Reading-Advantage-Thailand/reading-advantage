"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Flame, Skull } from "lucide-react";
import type { Difficulty } from "@/lib/games/enchantedLibrary";

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const DIFFICULTY_INFO: Record<
  Difficulty,
  {
    label: string;
    description: string;
    xpMultiplier: number;
    icon: typeof Zap;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  easy: {
    label: "Easy",
    description: "Fewer spirits, slower pace",
    xpMultiplier: 1.0,
    icon: Zap,
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-400",
  },
  normal: {
    label: "Normal",
    description: "Balanced challenge",
    xpMultiplier: 1.5,
    icon: Shield,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-400",
  },
  hard: {
    label: "Hard",
    description: "More spirits, faster pace",
    xpMultiplier: 2.0,
    icon: Flame,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-400",
  },
  extreme: {
    label: "Extreme",
    description: "Maximum challenge!",
    xpMultiplier: 3.0,
    icon: Skull,
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-400",
  },
};

export function DifficultySelector({
  selected,
  onSelect,
}: DifficultySelectorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-center mb-4 text-amber-900">
        Select Difficulty
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(Object.keys(DIFFICULTY_INFO) as Difficulty[]).map((difficulty) => {
          const info = DIFFICULTY_INFO[difficulty];
          const Icon = info.icon;
          const isSelected = selected === difficulty;

          return (
            <motion.button
              key={difficulty}
              onClick={() => onSelect(difficulty)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${info.bgColor} ${info.borderColor} shadow-lg scale-105`
                  : "bg-white border-amber-200 hover:border-amber-300 hover:shadow-md"
              }`}
              whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon
                  className={`w-8 h-8 ${isSelected ? info.color : "text-amber-600"}`}
                />
                <div className="text-center">
                  <div
                    className={`font-bold text-sm ${isSelected ? info.color : "text-amber-900"}`}
                  >
                    {info.label}
                  </div>
                  <div className="text-xs text-amber-700 mt-1">
                    {info.description}
                  </div>
                  <div className="text-xs font-semibold text-amber-600 mt-2">
                    {info.xpMultiplier}x XP
                  </div>
                </div>
              </div>
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-amber-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
