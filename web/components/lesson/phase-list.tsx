"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PhaseListProps {
  phases: string[];
  currentPhase: number;
  /** Mobile accordion expanded state */
  isExpanded: boolean;
  onToggleExpanded: () => void;
  /** ref passed to the collapsible content div for height animation */
  contentRef: React.RefObject<HTMLDivElement | null>;
  maxHeight: string;
}

/**
 * Renders the sidebar phase progress list.
 * - Mobile: shows current phase label + accordion toggle
 * - Desktop: always-visible numbered list with status dots
 *
 * Extracted from LessonProgressBar to reduce its size.
 */
const PhaseList: React.FC<PhaseListProps> = ({
  phases,
  currentPhase,
  isExpanded,
  onToggleExpanded,
  contentRef,
  maxHeight,
}) => {
  return (
    <div className="p-6">
      {/* ── Mobile Accordion ── */}
      <div className="xl:hidden">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-900 dark:text-white">
            Current: {phases[currentPhase - 1]}
          </span>
          <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div
          ref={contentRef}
          style={{ maxHeight }}
          className="transition-all duration-500 ease-in-out overflow-hidden"
        >
          <div className="space-y-3">
            {phases.map((phase, index) => (
              <PhaseItem
                key={index}
                index={index}
                phase={phase}
                currentPhase={currentPhase}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop List ── */}
      <div className="hidden xl:block space-y-3">
        {phases.map((phase, index) => (
          <PhaseItem
            key={index}
            index={index}
            phase={phase}
            currentPhase={currentPhase}
          />
        ))}
      </div>
    </div>
  );
};

// ── Internal helper ──────────────────────────────────────────────────────────

interface PhaseItemProps {
  index: number;
  phase: string;
  currentPhase: number;
}

const PhaseItem: React.FC<PhaseItemProps> = ({ index, phase, currentPhase }) => {
  const isActive = index + 1 === currentPhase;
  const isCompleted = index + 1 < currentPhase;

  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 ${
          isActive
            ? "bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900 scale-110"
            : isCompleted
              ? "bg-green-500 scale-100"
              : "bg-gray-300 dark:bg-gray-600 scale-90"
        }`}
      />
      <span
        className={`text-sm leading-tight transition-all duration-200 ${
          isCompleted
            ? "text-gray-400 line-through"
            : isActive
              ? "text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {index + 1}. {phase}
      </span>
    </div>
  );
};

PhaseList.displayName = "PhaseList";
export default PhaseList;
