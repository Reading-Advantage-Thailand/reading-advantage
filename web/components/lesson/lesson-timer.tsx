"use client";

import React from "react";
import { Timer } from "lucide-react";
import { useTimer } from "@/contexts/timer-context";
import { formatElapsedTime } from "./utils";

/**
 * Displays the current lesson elapsed time from the TimerContext.
 * Extracted from LessonProgressBar to avoid re-defining inside render.
 */
const LessonTimer: React.FC = () => {
  const { elapsedTime } = useTimer();

  return (
    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
      <Timer className="h-4 w-4" />
      <div className="text-sm font-medium">
        {formatElapsedTime(elapsedTime)}
      </div>
    </div>
  );
};

LessonTimer.displayName = "LessonTimer";
export default LessonTimer;
