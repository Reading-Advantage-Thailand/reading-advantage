"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ClassroomData = {
  id: string;
  classroomName: string;
  classCode: string;
  grade: string;
  archived: boolean;
  title: string;
  importedFromGoogle: boolean;
  alternateLink: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  isOwner: boolean;
  teachers: Array<{
    teacherId: string;
    name: string;
    role: string;
    joinedAt: string;
  }>;
  student: Array<{
    studentId: string;
    email: string;
    lastActivity: string;
  }>;
  xpData?: {
    today: number;
    week: number;
    month: number;
    allTime: number;
  };
};

interface ClassroomXpComparisonChartProps {
  classes: ClassroomData[];
}

type TimeRange = "today" | "week" | "month" | "allTime";
type ChartType = "line" | "bar";

const timeRangeLabels = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  allTime: "All Time",
};

const chartConfig = {
  xp: {
    label: "XP",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function ClassroomXpComparisonChart({
  classes,
}: ClassroomXpComparisonChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [maxClassrooms, setMaxClassrooms] = useState<number>(10);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeClassrooms = useMemo(() => {
    return classes.filter(
      (classroom) =>
        !classroom.archived &&
        classroom.xpData &&
        (classroom.xpData.today > 0 ||
          classroom.xpData.week > 0 ||
          classroom.xpData.month > 0 ||
          classroom.xpData.allTime > 0)
    );
  }, [classes]);

  const chartData = useMemo(() => {
    let data = activeClassrooms
      .map((classroom) => ({
        name: classroom.classroomName,
        shortName:
          classroom.classroomName.length > 15
            ? classroom.classroomName.substring(0, 15) + "..."
            : classroom.classroomName,
        xp: classroom.xpData?.[timeRange] || 0,
        students: classroom.student.length,
        teacher: classroom.createdBy.name,
        grade: classroom.grade,
      }))
      .filter((item) => item.xp > 0)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, maxClassrooms);

    return data;
  }, [activeClassrooms, timeRange, maxClassrooms]);

  const totalXp = chartData.reduce((sum, item) => sum + item.xp, 0);
  const averageXp =
    chartData.length > 0 ? Math.round(totalXp / chartData.length) : 0;
  const topClassroom = chartData[0];

  if (activeClassrooms.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Classroom XP Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No classroom data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Classroom XP Comparison</span>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>Total: {totalXp.toLocaleString()} XP</span>
            <span>•</span>
            <span>Average: {averageXp.toLocaleString()} XP</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Time Range Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">
              Time Range:
            </span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(timeRangeLabels).map(([key, label]) => (
                <Button
                  key={key}
                  onClick={() => setTimeRange(key as TimeRange)}
                  variant={timeRange === key ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium whitespace-nowrap">
                Chart Type:
              </span>
              <Select
                value={chartType}
                onValueChange={(value) => setChartType(value as ChartType)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium whitespace-nowrap">
                Show Top:
              </span>
              <Select
                value={maxClassrooms.toString()}
                onValueChange={(value) => setMaxClassrooms(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        {topClassroom && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-primary/10 p-3 sm:p-4 rounded-lg">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Top Classroom
              </div>
              <div
                className="font-semibold text-sm sm:text-base truncate"
                title={topClassroom.name}
              >
                {topClassroom.name}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {topClassroom.xp.toLocaleString()} XP
              </div>
            </div>
            <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Active Classrooms
              </div>
              <div className="font-semibold text-sm sm:text-base">
                {chartData.length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                with activity
              </div>
            </div>
            <div className="bg-accent/50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Total Students
              </div>
              <div className="font-semibold text-sm sm:text-base">
                {chartData.reduce((sum, item) => sum + item.students, 0)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                in active classes
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-center">
            <p className="text-muted-foreground">
              No data available for {timeRangeLabels[timeRange].toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="w-full">
            <ChartContainer
              config={chartConfig}
              className="h-[400px] sm:h-[400px] lg:h-[450px] w-full"
            >
              {chartType === "bar" ? (
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: isMobile ? 20 : 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="shortName"
                    angle={isMobile ? -90 : -45}
                    textAnchor="end"
                    height={isMobile ? 80 : 60}
                    fontSize={isMobile ? 10 : 12}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                    fontSize={isMobile ? 10 : 12}
                    width={isMobile ? 40 : 60}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-md max-w-xs">
                            <p className="font-semibold text-sm">{data.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Grade {data.grade}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Teacher: {data.teacher}
                            </p>
                            <p className="text-xs">Students: {data.students}</p>
                            <p className="font-medium text-primary text-sm">
                              XP: {data.xp.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="xp"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: isMobile ? 80 : 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="shortName"
                    angle={isMobile ? -90 : -45}
                    textAnchor="end"
                    height={isMobile ? 80 : 60}
                    fontSize={isMobile ? 10 : 12}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                    fontSize={isMobile ? 10 : 12}
                    width={isMobile ? 40 : 60}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-md max-w-xs">
                            <p className="font-semibold text-sm">{data.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Grade {data.grade}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Teacher: {data.teacher}
                            </p>
                            <p className="text-xs">Students: {data.students}</p>
                            <p className="font-medium text-primary text-sm">
                              XP: {data.xp.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="hsl(var(--primary))"
                    strokeWidth={isMobile ? 2 : 3}
                    dot={{
                      fill: "hsl(var(--primary))",
                      strokeWidth: 2,
                      r: isMobile ? 3 : 4,
                    }}
                    activeDot={{ r: isMobile ? 4 : 6 }}
                  />
                </LineChart>
              )}
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
