"use client";

import React from "react";
import { WidgetShell } from "./widget-shell";
import { KPICard } from "./kpi-card";
import { TrendingUp, Clock, Target, Activity } from "lucide-react";
import { VelocityMetrics } from "@/server/services/metrics/velocity-service";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface XPVelocityWidgetProps {
  data: VelocityMetrics | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function XPVelocityWidget({
  data,
  loading = false,
  onRefresh,
}: XPVelocityWidgetProps) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return [
      {
        period: "Last 7 Days",
        value: data.xpPerCalendarDay7d,
        label: "7d avg",
      },
      {
        period: "Last 30 Days",
        value: data.xpPerCalendarDay30d,
        label: "30d avg",
      },
      {
        period: "EMA Velocity",
        value: data.emaVelocity,
        label: "Trend",
      },
    ];
  }, [data]);

  const getTrendDirection = (): "up" | "down" | "neutral" => {
    if (!data) return "neutral";
    if (data.xpPerCalendarDay7d > data.xpPerCalendarDay30d) return "up";
    if (data.xpPerCalendarDay7d < data.xpPerCalendarDay30d) return "down";
    return "neutral";
  };

  if (!data && !loading) {
    return (
      <WidgetShell
        title="XP Velocity"
        description="Track your learning pace"
        icon={TrendingUp}
        isEmpty
        emptyMessage="No activity data available"
        onRefresh={onRefresh}
      >
        <div />
      </WidgetShell>
    );
  }

  return (
    <WidgetShell
      title="XP Velocity"
      description="Your learning pace over time"
      icon={TrendingUp}
      loading={loading}
      onRefresh={onRefresh}
      telemetryId="student.xp_velocity"
    >
      <div className="space-y-4" role="region" aria-label="XP Velocity Metrics">
        <div
          className="grid grid-cols-2 gap-4"
          role="group"
          aria-label="Quick Stats"
        >
          <KPICard
            title="7-Day Avg"
            value={data?.xpPerCalendarDay7d?.toFixed(1) || "0"}
            description="XP per day"
            icon={Activity}
            loading={loading}
            trend={{
              value: data?.xpPerCalendarDay7d || 0,
              direction: getTrendDirection(),
            }}
          />
          <KPICard
            title="Active Days"
            value={data?.activeDays7d || 0}
            description="Last 7 days"
            icon={Clock}
            loading={loading}
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="label"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {payload[0].payload.period}
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value} XP/day
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  activeDot={{
                    r: 6,
                    style: { fill: "hsl(var(--primary))" },
                  }}
                  style={{
                    stroke: "hsl(var(--primary))",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {data?.isLowSignal && (
          <p className="text-xs text-muted-foreground">
            💡 Tip: Complete more activities for better velocity tracking
          </p>
        )}
      </div>
    </WidgetShell>
  );
}
