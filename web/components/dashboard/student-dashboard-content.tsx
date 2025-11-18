"use client";

import React from "react";
import { XPVelocityWidget } from "./student-xp-velocity";
import { ETACard } from "./student-eta-card";
import { GenreEngagementWidget } from "./student-genre-engagement";
import { SRSHealthCard } from "./student-srs-health";
import { AICoachCard } from "./student-ai-coach";
import CEFRLevels from "./user-level-indicator";
import { CompactActivityHeatmap } from "./compact-activity-heatmap";
import ActivityTimeline from "./activity-timeline";
import { ActiveGoalsWidget } from "./active-goals-widget";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { VelocityMetrics } from "@/server/services/metrics/velocity-service";
import { GenreMetricsResponse } from "@/server/services/metrics/genre-engagement-service";
import { useDashboardTelemetry } from "@/lib/telemetry/dashboard-telemetry";

interface StudentDashboardContentProps {
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    level: number;
    cefr_level: string;
    xp: number;
  };
}

interface DashboardData {
  velocity: VelocityMetrics | null;
  genres: GenreMetricsResponse | null;
  srsHealth: any | null;
  aiInsights: any | null;
  activityTimeline: any | null;
}

export default function StudentDashboardContent({
  userId,
  user,
}: StudentDashboardContentProps) {
  const router = useRouter();
  const { trackEvent } = useDashboardTelemetry();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<DashboardData>({
    velocity: null,
    genres: null,
    srsHealth: null,
    aiInsights: null,
    activityTimeline: null,
  });

  // Track dashboard view
  React.useEffect(() => {
    trackEvent("student_dashboard.view", {
      cefrLevel: user.cefr_level,
      currentLevel: user.level,
      xp: user.xp,
    });
  }, [trackEvent, user]);

  // Fetch all dashboard data
  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all metrics in parallel
      const [velocityRes, genresRes, srsRes, aiRes, activityRes] =
        await Promise.allSettled([
          fetch(`/api/v1/metrics/velocity?studentId=${userId}`),
          fetch(
            `/api/v1/metrics/genres?studentId=${userId}&timeframe=30d&enhanced=true&includeRecommendations=true`
          ),
          fetch(`/api/v1/metrics/srs?studentId=${userId}&includeDetails=true`),
          fetch(`/api/v1/ai/summary?userId=${userId}&kind=student`),
          fetch(
            `/api/v1/metrics/activity?entityId=${userId}&scope=student&format=timeline&timeframe=30d`
          ),
        ]);

      // Process velocity data
      if (velocityRes.status === "fulfilled" && velocityRes.value.ok) {
        const velocityData = await velocityRes.value.json();

        // Check if response has student scope structure
        if (velocityData.scope === "student" && velocityData.student) {
          setData((prev) => ({ ...prev, velocity: velocityData.student }));
        } else {
          console.error("Unexpected velocity data structure:", velocityData);
        }
      } else if (velocityRes.status === "fulfilled") {
        console.error("Velocity fetch failed:", await velocityRes.value.text());
      }

      // Process genre data
      if (genresRes.status === "fulfilled" && genresRes.value.ok) {
        const genreData = await genresRes.value.json();
        setData((prev) => ({ ...prev, genres: genreData }));
      } else if (genresRes.status === "fulfilled") {
        console.error("Genre fetch failed:", await genresRes.value.text());
      }

      // Process SRS health data
      if (srsRes.status === "fulfilled" && srsRes.value.ok) {
        const srsData = await srsRes.value.json();

        // Check if response has student scope structure
        if (srsData.scope === "student" && srsData.student) {
          setData((prev) => ({ ...prev, srsHealth: srsData }));
        } else {
          console.error(
            "Unexpected SRS data structure - expected student scope:",
            srsData
          );
        }
      } else if (srsRes.status === "fulfilled") {
        console.error("SRS fetch failed:", await srsRes.value.text());
      }

      // Process AI insights (optional)
      if (aiRes.status === "fulfilled" && aiRes.value.ok) {
        const aiData = await aiRes.value.json();
        setData((prev) => ({ ...prev, aiInsights: aiData }));
      }

      // Process activity timeline
      if (activityRes.status === "fulfilled" && activityRes.value.ok) {
        const activityData = await activityRes.value.json();
        setData((prev) => ({ ...prev, activityTimeline: activityData }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePracticeFlashcards = () => {
    router.push("/student/practice");
  };

  const handleSetGoal = () => {
    router.push("/student/goals");
  };

  const handleGenreClick = (genre: string) => {
    router.push(`/student/articles?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-6">
      {/* Left Column - Main Widgets */}
      <div className="flex flex-col gap-4 col-span-2">
        {/* XP Velocity */}
        <XPVelocityWidget
          data={data.velocity}
          loading={loading}
          onRefresh={fetchDashboardData}
        />

        {/* ETA Card - conditionally rendered */}
        <ETACard
          data={data.velocity}
          loading={loading}
          onRefresh={fetchDashboardData}
        />

        {/* Genre Engagement */}
        <GenreEngagementWidget
          data={data.genres}
          loading={loading}
          onRefresh={fetchDashboardData}
          onGenreClick={handleGenreClick}
        />

        {/* Activity Timeline */}
        <ActivityTimeline
          entityId={userId}
          defaultTimeframe="30d"
          showFilters
          showStats
        />
      </div>

      {/* Right Column - Side Widgets */}
      <div className="flex flex-col gap-4">
        {/* CEFR Level Indicator */}
        <CEFRLevels currentLevel={user.cefr_level} />

        {/* Active Goals Widget */}
        <ActiveGoalsWidget userId={userId} />

        {/* SRS Health Card */}
        <SRSHealthCard
          data={
            data.srsHealth?.student
              ? {
                  userId: data.srsHealth.student.userId,
                  healthStatus:
                    data.srsHealth.student.isOverloaded ||
                    data.srsHealth.student.hasCriticalBacklog
                      ? "critical"
                      : data.srsHealth.student.totalDueForReview > 20
                        ? "moderate"
                        : "healthy",
                  metrics: {
                    totalCards: data.srsHealth.student.totalCards,
                    dueToday: data.srsHealth.student.totalDueForReview,
                    overdue: data.srsHealth.student.totalOverdue,
                    newCardsToday:
                      data.srsHealth.student.vocabulary.new +
                      data.srsHealth.student.sentences.new,
                    reviewedToday: 0,
                    avgRetentionRate:
                      data.srsHealth.student.overallMasteryPct / 100,
                  },
                  recommendations:
                    data.srsHealth.student.suggestedActions
                      ?.slice(0, 3)
                      .map((action: any) => ({
                        action: action.title,
                        priority: action.priority,
                        reason: action.description,
                      })) || [],
                  quickActions:
                    data.srsHealth.quickActions?.map((action: any) => ({
                      label: action.title,
                      count: action.targetCount || 0,
                      action: action.type,
                    })) || [],
                }
              : null
          }
          loading={loading}
          onRefresh={fetchDashboardData}
          onPracticeClick={handlePracticeFlashcards}
        />

        {/* Activity Heatmap */}
        <CompactActivityHeatmap entityId={userId} timeframe="90d" />
      </div>
      <div className="flex flex-col gap-4 col-span-3">
        {/* AI Coach Card */}
        <AICoachCard
          insights={data.aiInsights?.insights || null}
          metrics={
            data.velocity
              ? {
                  currentXp: data.velocity.currentXp,
                  velocity: data.velocity.emaVelocity,
                  genresRead: data.genres?.topGenres?.length || 0,
                  retentionRate: data.srsHealth?.metrics?.avgRetentionRate || 0,
                }
              : undefined
          }
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      </div>
    </div>
  );
}
