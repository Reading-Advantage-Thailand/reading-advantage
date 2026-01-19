import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BattleResultsProps {
  outcome: "victory" | "defeat";
  xp: number;
  accuracy: number;
  onRestart: () => void;
}

export function BattleResults({
  outcome,
  xp,
  accuracy,
  onRestart,
}: BattleResultsProps) {
  const title = outcome === "victory" ? "Victory" : "Defeat";
  const accentClass =
    outcome === "victory" ? "text-emerald-400" : "text-rose-400";
  const bgGradient =
    outcome === "victory"
      ? "from-emerald-500/20 to-transparent"
      : "from-rose-500/20 to-transparent";

  return (
    <div className="flex min-h-[360px] items-center justify-center p-4">
      <Card
        className={`w-full max-w-md border-slate-700/50 bg-gradient-to-b ${bgGradient} bg-slate-900/95 backdrop-blur-md shadow-2xl`}
      >
        <CardHeader>
          <CardTitle
            className={`text-3xl text-center font-bold ${accentClass}`}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-3">
              <p className="text-xs uppercase text-slate-400">XP Earned</p>
              <p className="text-2xl font-bold text-slate-100">{xp}</p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-3">
              <p className="text-xs uppercase text-slate-400">Accuracy</p>
              <p className="text-2xl font-bold text-slate-100">
                {Math.round(accuracy * 100)}%
              </p>
            </div>
          </div>
          <Button onClick={onRestart} className="w-full" size="lg">
            Play Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
