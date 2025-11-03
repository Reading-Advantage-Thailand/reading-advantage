"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityData {
  date: string;
  count: number;
  level: number; // 0-4 for color intensity
}

interface CompactActivityHeatmapProps {
  licenseId?: string;
  timeframe?: string;
  className?: string;
}

export function CompactActivityHeatmap({
  licenseId,
  timeframe = "30d",
  className,
}: CompactActivityHeatmapProps) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, peak: 0, average: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (licenseId) params.append('licenseId', licenseId);

        // Fetch activity data from dashboard API
        const response = await fetch(`/api/v1/admin/dashboard?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }

        const result = await response.json();
        
        // Process activity log to create heatmap data
        const activityLog = result.data.filteredActivityLog || [];
        
        // Generate data for the last 90 days
        const days = 90;
        const today = new Date();
        const activityData: ActivityData[] = [];
        
        // Count activities per day
        const activityByDate = new Map<string, number>();
        
        activityLog.forEach((activity: any) => {
          const date = new Date(activity.timestamp).toISOString().split("T")[0];
          activityByDate.set(date, (activityByDate.get(date) || 0) + 1);
        });
        
        // Find max activity for normalization
        const maxCount = Math.max(...Array.from(activityByDate.values()), 1);

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          
          const count = activityByDate.get(dateStr) || 0;

          // Map count to intensity level (0-4) based on thresholds
          // 0 = no activity (gray)
          // 1 = 1-9 activities (light green)
          // 2 = 10-29 activities (medium green)
          // 3 = 30-49 activities (dark green)
          // 4 = 50+ activities (darkest green)
          let level = 0;
          
          if (count >= 50) level = 4;
          else if (count >= 30) level = 3;
          else if (count >= 10) level = 2;
          else if (count >= 1) level = 1;

          activityData.push({
            date: dateStr,
            count,
            level,
          });
        }

        setData(activityData);

        // Calculate stats
        const total = activityData.reduce((sum, d) => sum + d.count, 0);
        const peak = Math.max(...activityData.map((d) => d.count));
        const average = activityData.length > 0 ? Math.round(total / activityData.length) : 0;
        setStats({ total, peak, average });
      } catch (error) {
        console.error("Error fetching activity data:", error);
        // Fallback to empty data on error
        setData([]);
        setStats({ total: 0, peak: 0, average: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [licenseId, timeframe]);

  const getColorClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted hover:bg-muted/80";
      case 1:
        return "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50";
      case 2:
        return "bg-green-300 dark:bg-green-700/60 hover:bg-green-400 dark:hover:bg-green-700/80";
      case 3:
        return "bg-green-500 dark:bg-green-600/80 hover:bg-green-600 dark:hover:bg-green-600";
      case 4:
        return "bg-green-700 dark:bg-green-500 hover:bg-green-800 dark:hover:bg-green-400";
      default:
        return "bg-muted";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getMonthLabels = () => {
    const labels: { month: string; position: number }[] = [];
    let lastMonth = "";

    data.forEach((item, index) => {
      const date = new Date(item.date);
      const month = date.toLocaleDateString("en-US", { month: "short" });

      if (month !== lastMonth && (index === 0 || index % 7 === 0)) {
        labels.push({ month, position: index });
        lastMonth = month;
      }
    });

    return labels;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const monthLabels = getMonthLabels();
  const weeks = Math.ceil(data.length / 7);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5" />
          Activity Heatmap
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Last 90 days</span>
          <Badge variant="secondary" className="text-xs">
            {stats.total.toLocaleString()} activities
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats - Compact horizontal layout */}
        <div className="flex items-center justify-center gap-10 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">
                {stats.total.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Day</p>
              <p className="text-lg font-bold">{stats.peak}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily Avg</p>
              <p className="text-lg font-bold">{stats.average}</p>
            </div>
          </div>
        </div>

        {/* Heatmap - Full width */}
        <div className="space-y-3">
          {/* Month labels */}
          <div className="relative h-4">
            <div className="flex text-xs text-muted-foreground font-medium">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{ left: `${(label.position / data.length) * 100}%` }}
                >
                  {label.month}
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="w-full overflow-x-auto pb-2">
            <TooltipProvider>
              <div className="inline-flex gap-1 min-w-full">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground justify-around py-1">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Grid by weeks (columns) */}
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: weeks }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const dataIndex = weekIndex * 7 + dayIndex;
                        if (dataIndex >= data.length)
                          return <div key={dayIndex} className="w-3 h-3" />;

                        const item = data[dataIndex];
                        return (
                          <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary",
                                  getColorClass(item.level)
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-semibold">
                                  {formatDate(item.date)}
                                </p>
                                <p className="text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    {item.count}
                                  </span>{" "}
                                  activities
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn("w-3 h-3 rounded-sm", getColorClass(level))}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Hover over squares for details
            </p>
          </div>

          {/* Top Activity Dates */}
          <div className="pt-4 border-t mt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Top Activity Dates
            </h4>
            <div className="space-y-2">
              {data
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {formatDate(item.date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {item.count}
                      </Badge>
                      <div
                        className={cn(
                          "w-3 h-3 rounded-sm",
                          getColorClass(item.level)
                        )}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
