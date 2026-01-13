import React, { useState } from "react";
import { VocabularyItem } from "@/store/useGameStore";
import { Wand2, BookOpen, Flame } from "lucide-react";

interface StartScreenProps {
  vocabulary: VocabularyItem[];
  onStart: () => void;
}

export function StartScreen({ vocabulary, onStart }: StartScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      onStart();
    }, 500);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-slate-900/40 backdrop-blur-[2px]">
      <div className="relative z-20 flex h-full flex-col">
        {/* Header Section */}
        <div className="px-6 py-4 flex-none">
          <div className="text-[10px] uppercase tracking-[0.3em] text-purple-300/60 mb-1 font-bold">
            Magic Defense
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Defense Briefing
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Review the spells (vocabulary) to defend your castles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                Ready
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-h-0 px-6 pb-6 pt-2">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] h-full">
            {/* Left Column: Briefing/Avatar Card */}
            <div className="relative flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-8 text-center backdrop-blur-md overflow-hidden group">
              {/* Background subtle glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px] -z-10 group-hover:bg-purple-500/30 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent opacity-50" />

              <div className="relative z-10 p-4">
                {/* Decorative rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-purple-400/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-purple-400/10 animate-[spin_15s_linear_infinite_reverse]" />

                {/* Theme Avatar */}
                <div className="relative z-20 h-28 w-28 rounded-full border-2 border-purple-400/30 bg-slate-900/80 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <div className="absolute inset-2 rounded-full border border-white/10" />
                  <Wand2 className="h-12 w-12 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                </div>
              </div>

              <div className="relative z-10 mt-2 max-w-[240px]">
                <h3 className="text-lg font-bold text-white mb-2">
                  The Siege Begins
                </h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  Type correct translations to destroy falling meteors before
                  they impact your kingdom.
                </p>
              </div>
            </div>

            {/* Right Column: Vocabulary Preview */}
            <div className="flex flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-0 backdrop-blur-md overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  <BookOpen className="h-3 w-3" />
                  Spell Book
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {vocabulary.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm p-8">
                    <BookOpen className="h-8 w-8 mb-3 opacity-20" />
                    No vocabulary loaded yet.
                  </div>
                ) : (
                  <div className="grid gap-1">
                    {vocabulary.slice(0, 50).map((item, index) => (
                      <div
                        key={`${item.term}-${index}`}
                        className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                      >
                        <span className="font-bold text-slate-200 text-sm group-hover:text-purple-300 transition-colors">
                          {item.term}
                        </span>
                        <span className="text-slate-400 text-sm font-medium">
                          {item.translation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Progress/Difficulty Bar */}
        <div className="flex-none border-t border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Progress/Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <Flame className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1 max-w-sm hidden sm:block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-purple-300/70 font-bold">
                    Power Level
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-purple-300/50">
                    100%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                </div>
              </div>
            </div>

            {/* Right: Start Button */}
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="relative group overflow-hidden pl-8 pr-10 py-3 rounded-full bg-purple-600 text-white font-bold text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="flex items-center gap-2 relative z-10">
                Start Defense
                <Flame className="h-4 w-4 fill-current" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
