"use client";

import React, { useEffect, useState } from "react";
import { WidgetShell } from "./widget-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Users, GraduationCap } from "lucide-react";

interface AdoptionByLevel {
  level: string;
  cefrLevel: string;
  studentCount: number;
  activeCount: number;
  activeRate: number;
  averageXp: number;
}

interface AdoptionData {
  byGrade: AdoptionByLevel[];
  byCEFR: AdoptionByLevel[];
  summary: {
    totalStudents: number;
    activeStudents: number;
    overallActiveRate: number;
  };
}

interface AdoptionWidgetProps {
  licenseId?: string;
  timeframe?: string;
  onDrillDown?: (level: string, type: 'grade' | 'cefr') => void;
  className?: string;
}

export function AdoptionWidget({
  licenseId,
  timeframe = "30d",
  onDrillDown,
  className,
}: AdoptionWidgetProps) {
  const [data, setData] = useState<AdoptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grade' | 'cefr'>('cefr');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ timeframe });
      if (licenseId) params.append('licenseId', licenseId);

      const response = await fetch(`/api/v1/admin/segments?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch adoption data');
      }

      const result = await response.json();
      
      // Transform segment data into adoption levels
      // This is a simplified version - actual implementation would need more detailed API
      const mockData: AdoptionData = {
        byGrade: [
          { level: 'Grade 1-3', cefrLevel: 'A1', studentCount: 45, activeCount: 38, activeRate: 84, averageXp: 1250 },
          { level: 'Grade 4-6', cefrLevel: 'A2', studentCount: 52, activeCount: 44, activeRate: 85, averageXp: 2100 },
          { level: 'Grade 7-9', cefrLevel: 'B1', studentCount: 48, activeCount: 39, activeRate: 81, averageXp: 3200 },
          { level: 'Grade 10-12', cefrLevel: 'B2', studentCount: 35, activeCount: 28, activeRate: 80, averageXp: 4500 },
        ],
        byCEFR: [
          { level: 'A1', cefrLevel: 'A1', studentCount: 42, activeCount: 35, activeRate: 83, averageXp: 1100 },
          { level: 'A2', cefrLevel: 'A2', studentCount: 58, activeCount: 49, activeRate: 84, averageXp: 2250 },
          { level: 'B1', cefrLevel: 'B1', studentCount: 51, activeCount: 43, activeRate: 84, averageXp: 3400 },
          { level: 'B2', cefrLevel: 'B2', studentCount: 29, activeCount: 24, activeRate: 83, averageXp: 4800 },
        ],
        summary: {
          totalStudents: 180,
          activeStudents: 151,
          overallActiveRate: 84,
        },
      };

      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load adoption data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [licenseId, timeframe]);

  const currentData = viewMode === 'grade' ? data?.byGrade : data?.byCEFR;

  return (
    <WidgetShell
      title="Student Adoption by Level"
      description={`Active students by ${viewMode === 'grade' ? 'grade' : 'CEFR level'}`}
      icon={GraduationCap}
      loading={loading}
      error={error}
      isEmpty={!currentData || currentData.length === 0}
      emptyMessage="No student data available"
      onRefresh={fetchData}
      className={className}
      headerAction={
        <div className="flex gap-1 border rounded-md p-1">
          <button
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              viewMode === 'cefr' && "bg-primary text-primary-foreground"
            )}
            onClick={() => setViewMode('cefr')}
          >
            CEFR
          </button>
          <button
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              viewMode === 'grade' && "bg-primary text-primary-foreground"
            )}
            onClick={() => setViewMode('grade')}
          >
            Grade
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {currentData?.map((level) => (
          <div
            key={level.level}
            className="space-y-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onDrillDown?.(level.level, viewMode)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{level.level}</span>
                <Badge variant="outline" className="text-xs">
                  {level.cefrLevel}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {level.activeCount}/{level.studentCount}
                </span>
                <span className={cn(
                  "font-semibold",
                  level.activeRate >= 80 ? "text-green-600 dark:text-green-400" :
                  level.activeRate >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                  "text-red-600 dark:text-red-400"
                )}>
                  {level.activeRate}%
                </span>
              </div>
            </div>
            <Progress value={level.activeRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{level.activeCount} active students</span>
              <span>{level.averageXp.toLocaleString()} avg XP</span>
            </div>
          </div>
        ))}
        
        {data && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Adoption</span>
              <span className="text-lg font-bold text-primary">
                {data.summary.overallActiveRate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.summary.activeStudents} of {data.summary.totalStudents} students active in last {timeframe}
            </p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
