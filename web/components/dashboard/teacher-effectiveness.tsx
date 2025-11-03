"use client";

import React, { useEffect, useState } from "react";
import { WidgetShell } from "./widget-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GraduationCap, TrendingUp, Users, Award } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface TeacherMetrics {
  teacherId: string;
  teacherName: string;
  studentCount: number;
  activeStudents: number;
  averageProgress: number; // Average level gain
  engagementRate: number; // % of students active
  averageAccuracy: number;
  classCount: number;
}

interface TeacherEffectivenessProps {
  licenseId?: string;
  timeframe?: string;
  onTeacherClick?: (teacherId: string) => void;
  className?: string;
}

export function TeacherEffectiveness({
  licenseId,
  timeframe = "30d",
  onTeacherClick,
  className,
}: TeacherEffectivenessProps) {
  const [teachers, setTeachers] = useState<TeacherMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMetrics | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ timeframe });
      if (licenseId) params.append('licenseId', licenseId);

      // This would be a dedicated teacher effectiveness API endpoint
      // For now, using mock data
      const mockTeachers: TeacherMetrics[] = [
        {
          teacherId: "1",
          teacherName: "Ms. Johnson",
          studentCount: 28,
          activeStudents: 26,
          averageProgress: 1.8,
          engagementRate: 93,
          averageAccuracy: 87,
          classCount: 2,
        },
        {
          teacherId: "2",
          teacherName: "Mr. Smith",
          studentCount: 32,
          activeStudents: 28,
          averageProgress: 1.5,
          engagementRate: 88,
          averageAccuracy: 82,
          classCount: 2,
        },
        {
          teacherId: "3",
          teacherName: "Mrs. Davis",
          studentCount: 25,
          activeStudents: 24,
          averageProgress: 2.1,
          engagementRate: 96,
          averageAccuracy: 91,
          classCount: 2,
        },
        {
          teacherId: "4",
          teacherName: "Dr. Wilson",
          studentCount: 30,
          activeStudents: 25,
          averageProgress: 1.4,
          engagementRate: 83,
          averageAccuracy: 79,
          classCount: 2,
        },
        {
          teacherId: "5",
          teacherName: "Ms. Brown",
          studentCount: 27,
          activeStudents: 23,
          averageProgress: 1.6,
          engagementRate: 85,
          averageAccuracy: 84,
          classCount: 2,
        },
        {
          teacherId: "6",
          teacherName: "Mr. Taylor",
          studentCount: 29,
          activeStudents: 27,
          averageProgress: 1.9,
          engagementRate: 93,
          averageAccuracy: 89,
          classCount: 2,
        },
      ];

      setTeachers(mockTeachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [licenseId, timeframe]);

  const getPerformanceColor = (engagementRate: number, averageProgress: number) => {
    // High engagement + high progress = green
    if (engagementRate >= 90 && averageProgress >= 1.7) return "#22c55e";
    // Medium performance = yellow
    if (engagementRate >= 80 && averageProgress >= 1.3) return "#eab308";
    // Low performance = red
    return "#ef4444";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.teacherName}</p>
          <div className="space-y-1 text-sm">
            <p>Engagement: {data.engagementRate}%</p>
            <p>Progress: +{data.averageProgress} levels</p>
            <p>Accuracy: {data.averageAccuracy}%</p>
            <p className="text-muted-foreground">
              {data.activeStudents}/{data.studentCount} active students
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const topPerformers = [...teachers]
    .sort((a, b) => (b.engagementRate + b.averageProgress * 10) - (a.engagementRate + a.averageProgress * 10))
    .slice(0, 3);

  return (
    <WidgetShell
      title="Teacher Effectiveness"
      description="Student engagement vs. progress rate"
      icon={GraduationCap}
      loading={loading}
      error={error}
      isEmpty={teachers.length === 0}
      emptyMessage="No teacher data available"
      onRefresh={fetchData}
      className={className}
    >
      <div className="space-y-4">
        {/* Scatter Plot */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="engagementRate"
                name="Engagement Rate"
                unit="%"
                domain={[70, 100]}
                label={{ value: 'Engagement Rate (%)', position: 'bottom', offset: 0 }}
                className="text-xs"
              />
              <YAxis
                type="number"
                dataKey="averageProgress"
                name="Progress"
                unit=" levels"
                domain={[1.0, 2.5]}
                label={{ value: 'Progress (levels)', angle: -90, position: 'left' }}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={teachers}
                onClick={(data) => {
                  setSelectedTeacher(data);
                  onTeacherClick?.(data.teacherId);
                }}
              >
                {teachers.map((teacher, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPerformanceColor(teacher.engagementRate, teacher.averageProgress)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>High Performers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Needs Support</span>
          </div>
        </div>

        {/* Top Performers */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-yellow-500" />
            <h4 className="font-semibold text-sm">Top Performers</h4>
          </div>
          <div className="space-y-2">
            {topPerformers.map((teacher, index) => (
              <div
                key={teacher.teacherId}
                className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedTeacher(teacher);
                  onTeacherClick?.(teacher.teacherId);
                }}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <span className="font-medium text-sm">{teacher.teacherName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>{teacher.averageProgress.toFixed(1)} levels</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-500" />
                    <span>{teacher.engagementRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}
