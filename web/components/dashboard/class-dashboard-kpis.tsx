"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import {
  Users,
  BookOpen,
  TrendingUp,
  Target,
  Zap,
  Activity,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassOverviewResponse } from "@/types/dashboard";

interface ClassDashboardKPIsProps {
  classroomId: string;
}

export function ClassDashboardKPIs({ classroomId }: ClassDashboardKPIsProps) {
  const [data, setData] = useState<ClassOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/v1/teacher/class/${classroomId}/overview`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch class overview: ${res.statusText}`);
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching class overview:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load class data"
        );
      } finally {
        setLoading(false);
      }
    }

    if (classroomId) {
      fetchData();
    }
  }, [classroomId]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Error Loading Class Dashboard</CardTitle>
          </div>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { summary, performance } = data;
  const activityRate =
    summary.totalStudents > 0
      ? Math.round((summary.activeStudents30d / summary.totalStudents) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Students */}
      <KPICard
        title="Total Students"
        value={summary.totalStudents}
        description={`${summary.activeStudents7d} active this week`}
        icon={Users}
        loading={false}
        status="info"
      />

      {/* Active Students (30d) */}
      <KPICard
        title="Active Students"
        value={summary.activeStudents30d}
        description={`${activityRate}% activity rate`}
        icon={Activity}
        loading={false}
        status={
          activityRate >= 70
            ? "success"
            : activityRate >= 40
              ? "warning"
              : "error"
        }
      />

      {/* Average Level */}
      <KPICard
        title="Average Level"
        value={summary.averageLevel.toFixed(1)}
        description="Class reading level"
        icon={Target}
        loading={false}
        status="info"
      />

      {/* Total XP Earned */}
      <KPICard
        title="Total XP"
        value={summary.totalXpEarned.toLocaleString()}
        description="Cumulative class XP"
        icon={Zap}
        loading={false}
        status="success"
      />

      {/* Active Assignments */}
      <KPICard
        title="Active Assignments"
        value={summary.assignmentsActive}
        description="Currently ongoing"
        icon={BookOpen}
        loading={false}
        status="info"
      />

      {/* Completed Assignments */}
      <KPICard
        title="Completed"
        value={summary.assignmentsCompleted}
        description="Assignment submissions"
        icon={TrendingUp}
        loading={false}
        status="success"
      />
    </div>
  );
}
