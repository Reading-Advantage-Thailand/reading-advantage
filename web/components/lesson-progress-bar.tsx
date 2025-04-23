"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function VerticalProgress({
  translate,
  phases,
}: {
  phases: Array<string>;
  translate: {
    startLesson: string;
  };
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPhase, setCurrentPhase] = useState(1);

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isExpanded]);

  return (
    <div className="mt-4">
      <Card className="p-4">
        {/* Mobile view */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-blue-700">
              Phase {currentPhase}: {phases[currentPhase - 1]}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  Hide <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show All <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {/* Smooth Dropdown */}
          <div
            ref={contentRef}
            style={{ maxHeight }}
            className="transition-all duration-500 ease-in-out overflow-hidden space-y-3"
          >
            {phases.map((phase, index) => {
              const isActive = index + 1 === currentPhase;
              const isCompleted = index + 1 < currentPhase;

              return (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 
                      ${isActive ? "bg-blue-500 border-blue-500" : ""}
                      ${isCompleted ? "bg-green-500 border-green-500" : ""}
                      ${
                        !isActive && !isCompleted
                          ? "bg-white border-gray-300"
                          : ""
                      }
                    `}
                  />
                  <span
                    className={`text-sm ${
                      isCompleted
                        ? "text-gray-400 line-through"
                        : isActive
                        ? "text-blue-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {index + 1}. {phase}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:flex flex-col space-y-4 font-bold items-start max-w-[300px] min-w-[300px]">
          {phases.map((phase, index) => {
            const isActive = index + 1 === currentPhase;
            const isCompleted = index + 1 < currentPhase;

            return (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 
                    ${isActive ? "bg-blue-500 border-blue-500" : ""}
                    ${isCompleted ? "bg-green-500 border-green-500" : ""}
                    ${
                      !isActive && !isCompleted
                        ? "bg-white border-gray-300"
                        : ""
                    }
                  `}
                />
                <span
                  className={`text-sm ${
                    isCompleted
                      ? "text-gray-400 line-through"
                      : isActive
                      ? "text-blue-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {index + 1}. {phase}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      {currentPhase === 1 && (
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={() => setCurrentPhase(currentPhase + 1)}
          >
            {translate.startLesson}
          </Button>
        </div>
      )}

      {currentPhase < phases.length && currentPhase > 1 && (
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={() => setCurrentPhase(currentPhase + 1)}
          >
            Next Phase
          </Button>
        </div>
      )}

      {currentPhase <= phases.length && currentPhase > 1 && (
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={() => setCurrentPhase(currentPhase - 1)}
          >
            Previous Phase
          </Button>
        </div>
      )}
    </div>
  );
}
