"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface ActivityHeatmapProps {
  className?: string;
  dateRange?: string;
}

interface ActivityData {
  date: string;
  value: number;
  level: "low" | "medium" | "high" | "very-high";
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "reading" | "practice" | "assessment" | "achievement";
  user?: string;
}

const chartConfig = {
  activity: {
    label: "Activity",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "Users",
    color: "hsl(var(--chart-2))",
  },
  sessions: {
    label: "Sessions",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function ActivityCharts({
  className,
  dateRange = "30d",
}: ActivityHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<ActivityData[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Add timestamp to prevent caching
      const timestamp = Date.now();

      // Map dateRange to appropriate timeframe for API
      const getHeatmapTimeframe = () => {
        switch (dateRange) {
          case "7d":
            return "7d";
          case "30d":
            return "30d";
          case "90d":
            return "90d";
          case "all":
            return "all"; // Request all historical data
          default:
            return "30d";
        }
      };

      const getTimelineTimeframe = () => {
        switch (dateRange) {
          case "7d":
            return "7d";
          case "30d":
            return "30d";
          case "90d":
            return "90d";
          case "all":
            return "all"; // Request all historical data
          default:
            return "30d";
        }
      };

      const heatmapTimeframe = getHeatmapTimeframe();
      const timelineTimeframe = getTimelineTimeframe();

      // Fetch heatmap data from API
      const heatmapRes = await fetch(
        `/api/v1/metrics/activity?format=heatmap&timeframe=${heatmapTimeframe}&granularity=day&_t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      // Fetch timeline data from API
      const timelineRes = await fetch(
        `/api/v1/metrics/activity?format=timeline&timeframe=${timelineTimeframe}&_t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      let heatmapData: any = { buckets: [], metadata: {} };
      let timelineData: any = { events: [] };

      // Handle heatmap response
      if (heatmapRes.ok) {
        heatmapData = await heatmapRes.json();
      } else {
        console.error(
          "❌ Failed to fetch heatmap data:",
          heatmapRes.status,
          await heatmapRes.text()
        );
      }

      // Handle timeline response
      if (timelineRes.ok) {
        timelineData = await timelineRes.json();
      } else {
        console.error(
          "❌ Failed to fetch timeline data:",
          timelineRes.status,
          await timelineRes.text()
        );
      }

      // Process heatmap data
      const processedHeatmapData: ActivityData[] = [];
      const activityByDate = new Map<string, number>();

      // Aggregate activity counts by date
      if (heatmapData.buckets && Array.isArray(heatmapData.buckets)) {
        heatmapData.buckets.forEach((bucket: any) => {
          const existing = activityByDate.get(bucket.date) || 0;
          activityByDate.set(
            bucket.date,
            existing + (bucket.activityCount || 0)
          );
        });
      } else {
        console.warn("⚠️ No buckets array in heatmap data");
      }

      // Determine number of days to show based on dateRange
      const getHeatmapDays = () => {
        switch (dateRange) {
          case "7d":
            return 7;
          case "30d":
            return 30;
          case "90d":
            return 90;
          case "all":
            return 365; // Show full year for all time
          default:
            return 30;
        }
      };

      const heatmapDays = getHeatmapDays();

      // Fill in dates for the selected period
      const today = new Date();
      for (let i = 0; i < heatmapDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (heatmapDays - 1 - i));
        const dateString = date.toISOString().split("T")[0];
        const value = activityByDate.get(dateString) || 0;

        // Determine activity level based on actual data
        let level: ActivityData["level"] = "low";
        if (value === 0) level = "low";
        else if (value <= 3)
          level = "medium"; // 1-3 activities: light green
        else if (value <= 7)
          level = "high"; // 4-7 activities: medium green
        else level = "very-high"; // 8+ activities: dark green

        processedHeatmapData.push({
          date: dateString,
          value,
          level,
        });
      }

      // Process timeline events
      const processedTimelineEvents: TimelineEvent[] = [];
      if (timelineData.events && Array.isArray(timelineData.events)) {
        timelineData.events.slice(0, 10).forEach((event: any) => {
          let eventType: TimelineEvent["type"] = "reading";
          let title = event.title || "Activity";
          let description = event.description || "";

          // Map event types
          if (event.type === "assignment") {
            eventType = "assessment";
            title = event.title;
          } else if (event.type === "srs") {
            eventType = "practice";
            title = "SRS Practice Session";
          } else if (event.type === "reading") {
            eventType = "reading";
          } else if (event.type === "practice") {
            eventType = "practice";
          }

          processedTimelineEvents.push({
            id: event.id,
            title,
            description,
            timestamp: event.timestamp,
            type: eventType,
          });
        });
      }

      // Generate chart data from heatmap buckets based on selected date range
      const chartDataMap = new Map<
        string,
        { activity: number; sessions: number }
      >();

      if (heatmapData.buckets && Array.isArray(heatmapData.buckets)) {
        heatmapData.buckets.forEach((bucket: any) => {
          const existing = chartDataMap.get(bucket.date) || {
            activity: 0,
            sessions: 0,
          };

          existing.activity += bucket.activityCount || 0;
          existing.sessions += bucket.activityCount || 0;

          chartDataMap.set(bucket.date, existing);
        });
      }

      // Create chart data based on selected date range
      const getChartDays = () => {
        switch (dateRange) {
          case "7d":
            return 7;
          case "30d":
            return 30;
          case "90d":
            return 90;
          case "all":
            return 365; // Show last year for all time
          default:
            return 30;
        }
      };

      const chartDays = getChartDays();
      const processedChartData = [];
      for (let i = chartDays - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        const data = chartDataMap.get(dateString);

        processedChartData.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          activity: data?.activity || 0,
          users: heatmapData.metadata?.uniqueStudents || 0,
          sessions: data?.sessions || 0,
        });
      }

      setHeatmapData(processedHeatmapData);
      setTimelineEvents(processedTimelineEvents);
      setChartData(processedChartData);
    } catch (error) {
      console.error("❌ Error fetching activity data:", error);
      // Set empty data on error
      setHeatmapData([]);
      setTimelineEvents([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const getHeatmapColor = (level: ActivityData["level"]) => {
    switch (level) {
      case "very-high":
        return "bg-green-600";
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-green-300";
      case "low":
        return "bg-gray-200 dark:bg-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "reading":
        return "📖";
      case "practice":
        return "✏️";
      case "assessment":
        return "📊";
      case "achievement":
        return "🏆";
      default:
        return "📌";
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity Overview</h2>
        <p className="text-muted-foreground">
          Monitor user activities, engagement patterns, and real-time events
          {dateRange && (
            <span className="ml-2 text-sm">
              (showing{" "}
              {dateRange === "7d"
                ? "last 7 days"
                : dateRange === "30d"
                  ? "last 30 days"
                  : dateRange === "90d"
                    ? "last 3 months"
                    : "all time"}
              )
            </span>
          )}
        </p>
      </div>

      {/* Activity Heatmap - Middle Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Activity Heatmap
          </CardTitle>
          <CardDescription>
            Daily activity levels
            {dateRange === "7d" && " over the past 7 days"}
            {dateRange === "30d" && " over the past 30 days"}
            {dateRange === "90d" && " over the past 3 months"}
            {dateRange === "all" && " over the past year"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="w-full overflow-x-auto">
              {(() => {
                const totalDays = heatmapData.length;
                const weeksToShow = Math.ceil(totalDays / 7);

                // Use horizontal layout for short periods (≤90 days)
                if (totalDays <= 90) {
                  // Horizontal layout - single row
                  const getCellSize = () => {
                    if (totalDays <= 7) return "h-16 flex-1 min-w-[60px]"; // 7 days: very tall, flexible width
                    if (totalDays <= 30) return "h-12 flex-1 min-w-[20px]"; // 30 days: tall, flexible
                    return "h-10 w-3"; // 31-90 days: medium height, fixed width
                  };

                  const cellSize = getCellSize();
                  const gapSize = totalDays <= 30 ? "gap-1.5" : "gap-1";

                  return (
                    <div className="space-y-3">
                      {/* Single horizontal row */}
                      <div className={`flex ${gapSize} items-end`}>
                        {heatmapData.map((day, index) => (
                          <div
                            key={index}
                            className={`${cellSize} rounded-sm ${getHeatmapColor(day.level)} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all relative group`}
                            title={`${day.date}: ${day.value} activities`}
                          >
                            {totalDays <= 7 && (
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(day.date).toLocaleDateString(
                                  "en-US",
                                  { weekday: "short" }
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Date labels for longer periods */}
                      {totalDays > 7 && (
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                          <span>
                            {heatmapData[0]?.date
                              ? new Date(
                                  heatmapData[0].date
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                          <span>
                            {heatmapData[heatmapData.length - 1]?.date
                              ? new Date(
                                  heatmapData[heatmapData.length - 1].date
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                // Grid layout for longer periods (>90 days)
                const getCellSize = () => {
                  if (weeksToShow <= 14) return "w-4 h-4"; // 91-98 days: medium
                  return "w-3 h-3"; // 99+ days: small
                };

                const cellSize = getCellSize();
                const gapSize = "gap-1";

                return (
                  <div className="flex flex-col gap-1 min-w-max">
                    {/* Create 7 rows for days of week */}
                    {Array.from({ length: 7 }).map((_, dayOfWeek) => (
                      <div
                        key={dayOfWeek}
                        className={`flex ${gapSize} items-center`}
                      >
                        <div className="w-8 text-xs text-muted-foreground">
                          {
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                              dayOfWeek
                            ]
                          }
                        </div>
                        <div className={`flex ${gapSize}`}>
                          {Array.from({ length: weeksToShow }).map(
                            (_, weekIndex) => {
                              const dayIndex = weekIndex * 7 + dayOfWeek;
                              const day = heatmapData[dayIndex];

                              if (!day) {
                                return (
                                  <div key={weekIndex} className={cellSize} />
                                );
                              }

                              return (
                                <div
                                  key={weekIndex}
                                  className={`${cellSize} rounded-sm ${getHeatmapColor(day.level)} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
                                  title={`${day.date}: ${day.value} activities`}
                                />
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Month labels - Dynamic based on date range */}
            {heatmapData.length > 90 && (
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                {(() => {
                  const firstDate = heatmapData[0]?.date
                    ? new Date(heatmapData[0].date)
                    : new Date();
                  const lastDate = heatmapData[heatmapData.length - 1]?.date
                    ? new Date(heatmapData[heatmapData.length - 1].date)
                    : new Date();

                  const months = [];
                  const currentMonth = new Date(firstDate);

                  while (currentMonth <= lastDate) {
                    months.push(
                      currentMonth.toLocaleDateString("en-US", {
                        month: "short",
                      })
                    );
                    currentMonth.setMonth(currentMonth.getMonth() + 1);
                  }

                  return months.map((month, index) => (
                    <span key={index}>{month}</span>
                  ));
                })()}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-1">
                {(() => {
                  const totalDays = heatmapData.length;
                  // Adjust legend size based on layout
                  const legendSize = totalDays <= 30 ? "w-4 h-4" : "w-3 h-3";

                  return (
                    <>
                      <div
                        className={`${legendSize} rounded-sm bg-gray-200 dark:bg-gray-700`}
                      />
                      <div
                        className={`${legendSize} rounded-sm bg-green-300`}
                      />
                      <div
                        className={`${legendSize} rounded-sm bg-green-500`}
                      />
                      <div
                        className={`${legendSize} rounded-sm bg-green-600`}
                      />
                    </>
                  );
                })()}
              </div>
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts - Top Section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trend</CardTitle>
            <CardDescription>
              Activity levels over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke="var(--color-activity)"
                  fill="var(--color-activity)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Users and sessions comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="var(--color-users)" />
                <Bar dataKey="sessions" fill="var(--color-sessions)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline - Bottom Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Timeline</CardTitle>
          <CardDescription>Latest user activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="text-2xl">{getEventIcon(event.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  {event.user && (
                    <p className="text-xs text-muted-foreground">
                      by {event.user}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeTime(event.timestamp)}
                </div>
              </div>
            ))}

            {timelineEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events found for the selected filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
