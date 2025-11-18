"use client";

import React from "react";
import { WidgetShell } from "./widget-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";
import { VelocityMetrics } from "@/server/services/metrics/velocity-service";
import { format, addDays } from "date-fns";

interface ETACardProps {
  data: VelocityMetrics | null;
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * ETA Card Widget
 * Shows estimated time to next level with confidence bands
 * Hides when velocity signal is weak (<1 XP/day or insufficient active days)
 */
export function ETACard({ data, loading = false, onRefresh }: ETACardProps) {
  // Hide ETA if low signal or velocity is too low
  const shouldHideETA = React.useMemo(() => {
    if (!data) return true;
    return data.isLowSignal || data.emaVelocity < 1;
  }, [data]);

  if (shouldHideETA && !loading) {
    return null; // Don't render if signal is weak
  }

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge variant="default">High Confidence</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Confidence</Badge>;
      case "low":
        return <Badge variant="outline">Low Confidence</Badge>;
      default:
        return <Badge variant="destructive">Insufficient Data</Badge>;
    }
  };

  const formatETA = (etaDays: number | null) => {
    if (etaDays === null) return "N/A";
    if (etaDays < 1) return "Less than 1 day";
    if (etaDays === 1) return "1 day";
    if (etaDays < 7) return `${Math.round(etaDays)} days`;
    if (etaDays < 30) return `${Math.round(etaDays / 7)} weeks`;
    return `${Math.round(etaDays / 30)} months`;
  };

  const etaDate = data?.etaDate
    ? new Date(data.etaDate)
    : data?.etaDays
      ? addDays(new Date(), data.etaDays)
      : null;

  return (
    <Card 
      className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background"
      role="article"
      aria-label="Estimated Time to Next Level"
    >
      <CardContent className="pt-6">
        <div className="space-y-4" role="region" aria-label="ETA Information">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Estimated Time to Next Level
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  {loading ? "..." : formatETA(data?.etaDays || null)}
                </h3>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            {data && getConfidenceBadge(data.confidenceBand)}
          </div>

          {etaDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Expected: {format(etaDate, "MMM d, yyyy")}</span>
            </div>
          )}

          {data && data.confidenceBand !== "none" && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium">Confidence Range</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Best case: {formatETA(data.etaConfidenceLow)}
                </span>
                <span>
                  Worst case: {formatETA(data.etaConfidenceHigh)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {(data?.currentLevel || 0) + 1}</span>
              <span className="font-medium">
                {data?.currentXp || 0} / {data?.nextLevelXp || 0} XP
              </span>
            </div>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${data ? ((data.currentXp - (data.nextLevelXp - data.xpToNextLevel)) / data.xpToNextLevel) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {data?.emaVelocity && data.emaVelocity > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>
                Based on your current velocity of {data.emaVelocity.toFixed(1)}{" "}
                XP/day
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
