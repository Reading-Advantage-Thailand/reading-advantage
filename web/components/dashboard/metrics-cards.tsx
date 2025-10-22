"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Users, 
  BookOpen, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Clock
} from "lucide-react";

interface MetricData {
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon: React.ComponentType<any>;
  color: string;
}

interface MetricsCardsProps {
  className?: string;
  dateRange?: string;
}

export default function MetricsCards({ className, dateRange = "30d" }: MetricsCardsProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch data from single optimized endpoint with dateRange parameter
        const response = await fetch(`/api/v1/metrics/dashboard-summary?dateRange=${dateRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard summary');
        }
        
        const summaryData = await response.json();

        // Calculate trend for velocity
        const velocityTrendValue = summaryData.velocity?.avgXpPerStudent7d && summaryData.velocity?.avgXpPerStudent30d
          ? Math.round(((summaryData.velocity.avgXpPerStudent7d - summaryData.velocity.avgXpPerStudent30d) / 
              summaryData.velocity.avgXpPerStudent30d) * 100)
          : 0;

        // Process and format the metrics data
        const processedMetrics: MetricData[] = [
          {
            title: "Total Sessions",
            value: summaryData.activity?.totalSessions?.toLocaleString() || "0",
            description: "Total reading sessions",
            trend: summaryData.trends?.sessionsGrowth !== undefined ? {
              value: Math.abs(summaryData.trends.sessionsGrowth),
              direction: summaryData.trends.sessionsGrowth >= 0 ? 'up' : 'down'
            } : undefined,
            icon: Activity,
            color: "text-blue-600"
          },
          {
            title: "Active Users",
            value: summaryData.activity?.totalActiveUsers?.toLocaleString() || "0",
            description: "Users active in period",
            trend: summaryData.trends?.usersGrowth !== undefined ? {
              value: Math.abs(summaryData.trends.usersGrowth),
              direction: summaryData.trends.usersGrowth >= 0 ? 'up' : 'down'
            } : undefined,
            icon: Users,
            color: "text-green-600"
          },
          {
            title: "Reading Sessions",
            value: summaryData.activity?.totalSessions?.toLocaleString() || "0",
            description: "Total reading sessions",
            trend: summaryData.trends?.sessionsGrowth !== undefined ? {
              value: Math.abs(summaryData.trends.sessionsGrowth),
              direction: summaryData.trends.sessionsGrowth >= 0 ? 'up' : 'down'
            } : undefined,
            icon: BookOpen,
            color: "text-purple-600"
          },
          {
            title: "Alignment Score",
            value: summaryData.alignment?.alignmentScore ? `${summaryData.alignment.alignmentScore}%` : "0%",
            description: "Content alignment quality",
            icon: Target,
            color: "text-orange-600"
          },
          {
            title: "Learning Velocity",
            value: summaryData.velocity?.avgXpPerStudent30d ? 
              `${summaryData.velocity.avgXpPerStudent30d.toFixed(0)} XP/student` : 
              "N/A",
            description: `Average XP per student (${dateRange})`,
            trend: summaryData.velocity ? {
              value: Math.abs(velocityTrendValue),
              direction: velocityTrendValue >= 0 ? 'up' : 'down'
            } : undefined,
            icon: Zap,
            color: "text-yellow-600"
          },
          {
            title: "Avg. Session Time",
            value: summaryData.activity?.averageSessionLength 
              ? `${summaryData.activity.averageSessionLength}m` 
              : "0m",
            description: "Average time per session",
            trend: summaryData.trends?.sessionTimeGrowth !== undefined ? {
              value: Math.abs(summaryData.trends.sessionTimeGrowth),
              direction: summaryData.trends.sessionTimeGrowth >= 0 ? 'up' : 'down'
            } : undefined,
            icon: Clock,
            color: "text-indigo-600"
          }
        ];

        setMetrics(processedMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Set default metrics if fetch fails
        setMetrics([
          {
            title: "Total Activity",
            value: "0",
            description: "User activities today",
            icon: Activity,
            color: "text-blue-600"
          },
          {
            title: "Active Users",
            value: "0",
            description: "Users active in last 24h",
            icon: Users,
            color: "text-green-600"
          },
          {
            title: "Reading Sessions",
            value: "0",
            description: "Articles read today",
            icon: BookOpen,
            color: "text-purple-600"
          },
          {
            title: "Alignment Score",
            value: "0%",
            description: "Content alignment quality",
            icon: Target,
            color: "text-orange-600"
          },
          {
            title: "Learning Velocity",
            value: "0",
            description: "Words per minute",
            icon: Zap,
            color: "text-yellow-600"
          },
          {
            title: "Avg. Session Time",
            value: "0m",
            description: "Time spent per session",
            icon: Clock,
            color: "text-indigo-600"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dateRange]); // Re-fetch when dateRange changes

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend?.direction === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center justify-between mt-2">
                <CardDescription className="text-xs">
                  {metric.description}
                </CardDescription>
                {metric.trend && (
                  <Badge 
                    variant={metric.trend.direction === 'up' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {Math.abs(metric.trend.value)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}