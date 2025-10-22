"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MetricsCards from "@/components/dashboard/metrics-cards";
import ActivityCharts from "@/components/dashboard/activity-charts";
import AIInsights from "@/components/dashboard/ai-insights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Activity,
  Brain,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";

// Modern redesigned components
import ModernLicenseUsage from "@/components/dashboard/modern-license-usage";
import ModernActiveUsers from "@/components/dashboard/modern-active-users";

// Types for dashboard data
interface DashboardData {
  overview?: {
    totalSchools?: number;
    totalStudents?: number;
    totalTeachers?: number;
    totalArticles?: number;
  };
  activity?: {
    readingSessions?: number;
    completionRate?: string;
  };
  health?: {
    database?: string;
    apiResponse?: string;
    errorRate?: string;
    uptime?: string;
  };
  genres?: any;
  assignments?: any;
  dateRange?: string;
  generatedAt?: string;
  errors?: Record<string, string>;
}

export default function SystemDashboardClient() {
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("30d");
  const [metricFilter, setMetricFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateRange,
        ...(metricFilter !== "all" && { filter: metricFilter }),
      });

      // Use system-wide metrics endpoint for overview
      let response = await axios.get(`/api/v1/metrics/system?${params}`);

      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, metricFilter]);

  useEffect(() => {
    // Fetch initial data
    fetchMetrics();
  }, [dateRange, metricFilter, fetchMetrics]);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  const handleExport = () => {
    // Export dashboard data
    const exportedData = {
      dateRange,
      metricFilter,
      data: dashboardData,
    };

    const blob = new Blob([JSON.stringify(exportedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!dashboardData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "" : ""}
          </Button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading metrics...</span>
            </div>
          </div>
        ) : dashboardData ? (
          <div>
            {/* Metrics Overview */}
            <section className="mb-6">
              <MetricsCards dateRange={dateRange} />
              {dashboardData?.errors && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    Some metrics may be unavailable:
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {Object.entries(dashboardData.errors).map(
                      ([key, error]) =>
                        error && (
                          <li key={key}>
                            • {key}: {String(error)}
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )}
            </section>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardContent className="mt-6">
                      <ModernLicenseUsage />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="mt-6">
                      <ModernActiveUsers page="system" dateRange={dateRange} />
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats Cards - Display dynamic data */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Schools
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData?.overview?.totalSchools || "0"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Active schools
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Articles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData?.overview?.totalArticles?.toLocaleString() ||
                          "0"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Available content
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData?.activity?.completionRate || "0%"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Articles completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(
                          (dashboardData?.overview?.totalStudents || 0) +
                          (dashboardData?.overview?.totalTeachers || 0)
                        ).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Students & Teachers
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-6">
                <ActivityCharts />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6 mt-6">
                <AIInsights />
              </TabsContent>

              <TabsContent value="admin" className="space-y-6 mt-6">
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                      <CardDescription>
                        Monitor system performance and health metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Database Performance</span>
                          <Badge variant="default">
                            {dashboardData?.health?.database || "Excellent"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">API Response Time</span>
                          <Badge variant="default">
                            {dashboardData?.health?.apiResponse || "Good"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Error Rate</span>
                          <Badge variant="default">
                            {dashboardData?.health?.errorRate || "Low"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Uptime</span>
                          <Badge variant="default">
                            {dashboardData?.health?.uptime || "99.9%"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Actions</CardTitle>
                      <CardDescription>
                        Latest administrative actions and changes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div className="flex-1">
                            <p className="text-sm">
                              New school license activated
                            </p>
                            <p className="text-xs text-muted-foreground">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm">Content library updated</p>
                            <p className="text-xs text-muted-foreground">
                              4 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <div className="flex-1">
                            <p className="text-sm">
                              System maintenance completed
                            </p>
                            <p className="text-xs text-muted-foreground">
                              1 day ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No data available</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or refresh the page
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
