"use client";

import { useState, useRef, useEffect } from "react";
import { Icons } from "@/components/icons";

export default function CollapsibleNotice() {
  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(expanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [expanded]);

  return (
    <div className="flex items-start gap-4 px-8">
      <Icons.AlertCircle className="mt-1 shrink-0" />
      <div className="text-sm leading-relaxed max-w-xl">
        <p>
          For language learners: This lesson is designed to take approximately
          30 to 45 minutes to complete.
        </p>
        <div
          ref={contentRef}
          style={{ maxHeight }}
          className="overflow-hidden transition-all duration-500 ease-in-out"
        >
          <p>
            Each phase within the lesson includes a built-in timer that tracks
            how much time is spent on different activities. This timing data
            will be used for learning analytics and may contribute to your
            overall performance score. The time tracking also helps us better
            understand how students interact with different parts of the lesson
            and improve future learning experiences. Please try to work through
            the lesson at a steady pace for the most accurate results.
          </p>
        </div>
        <button
          className="mt-2 text-xs text-blue-600 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      </div>
    </div>
  );
}
