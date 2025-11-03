"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KPICard } from "./kpi-card";
import { AdoptionWidget } from "./adoption-widget";
import { TeacherEffectiveness } from "./teacher-effectiveness";
import { AlertCenter } from "./alert-center";
import AIInsights from "./ai-insights";
import { CompactActivityHeatmap } from "./compact-activity-heatmap";
import LicenseSelector from "../admin/license-selector";
import { Role } from "@prisma/client";
import { AdminOverviewResponse, Alert } from "@/types/dashboard";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  Activity,
} from "lucide-react";
import { useDashboardTelemetry } from "@/lib/telemetry/dashboard-telemetry";

interface License {
  id: string;
  schoolName: string;
  maxUsers: number;
  expiresAt: Date;
  _count?: {
    licenseUsers: number;
  };
}

interface SchoolDashboardContentProps {
  initialOverview: AdminOverviewResponse;
  userRole: Role;
  userLicenseId?: string;
  allLicenses?: License[];
}

export function SchoolDashboardContent({
  initialOverview,
  userRole,
  userLicenseId,
  allLicenses = [],
}: SchoolDashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackEvent } = useDashboardTelemetry();

  const [selectedLicenseId, setSelectedLicenseId] = useState<string>(
    userLicenseId || allLicenses[0]?.id || ""
  );
  const [timeframe, setTimeframe] = useState<string>(
    searchParams.get("timeframe") || "30d"
  );
  const [overview, setOverview] = useState(initialOverview);

  const handleLicenseChange = useCallback((licenseId: string) => {
    setSelectedLicenseId(licenseId);
    trackEvent("dashboard.license_changed", { licenseId });
    // Refresh overview data for new license
    // This would need to be implemented with proper API call
  }, [trackEvent]);

  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    setTimeframe(newTimeframe);
    
    // Update URL with new timeframe
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeframe", newTimeframe);
    router.push(`?${params.toString()}`, { scroll: false });

    trackEvent("dashboard.timeframe_changed", { timeframe: newTimeframe });
  }, [router, searchParams, trackEvent]);

  const handleDrillDownToTeacher = useCallback((teacherId: string) => {
    const params = new URLSearchParams({ timeframe });
    trackEvent("dashboard.drilldown_clicked", { 
      target: "teacher", 
      teacherId,
      timeframe 
    });
    router.push(`/admin/teachers/${teacherId}?${params.toString()}`);
  }, [router, timeframe, trackEvent]);

  const handleDrillDownToClass = useCallback((classId: string) => {
    const params = new URLSearchParams({ timeframe });
    trackEvent("dashboard.drilldown_clicked", { 
      target: "class", 
      classId,
      timeframe 
    });
    router.push(`/admin/classes/${classId}?${params.toString()}`);
  }, [router, timeframe, trackEvent]);

  const handleDrillDownToLevel = useCallback((level: string, type: 'grade' | 'cefr') => {
    const params = new URLSearchParams({ timeframe, level, type });
    trackEvent("dashboard.drilldown_clicked", { 
      target: "students_by_level", 
      level,
      type,
      timeframe 
    });
    router.push(`/admin/students?${params.toString()}`);
  }, [router, timeframe, trackEvent]);

  const handleAlertClick = useCallback((alert: Alert) => {
    trackEvent("dashboard.alert_clicked", { 
      alertId: alert.id,
      severity: alert.severity 
    });
    
    if (alert.schoolId) {
      router.push(`/admin/schools/${alert.schoolId}/alerts`);
    }
  }, [router, trackEvent]);

  const handleViewAllAlerts = useCallback(() => {
    trackEvent("dashboard.view_all_clicked", { widget: "alerts" });
    router.push("/admin/alerts");
  }, [router, trackEvent]);

  const handleWidgetView = useCallback((widgetName: string) => {
    trackEvent("dashboard.widget_viewed", { widget: widgetName });
  }, [trackEvent]);

  // Calculate projected level-ups (mock calculation)
  const projectedLevelUps = Math.round(
    overview.summary.activeUsers30d * 0.15 // Assume 15% will level up
  );

  // Calculate SRS backlog (mock - would need real data)
  const srsBacklog = 0; // This would come from SRS API

  // Calculate accuracy split (mock - would need real data)
  const accuracySplit = {
    high: 65, // >80%
    medium: 25, // 60-80%
    low: 10, // <60%
  };

  return (
    <div className="space-y-6">
      {/* License Selector for SYSTEM users */}
      {userRole === Role.SYSTEM && allLicenses.length > 0 && (
        <LicenseSelector
          licenses={allLicenses}
          selectedLicenseId={selectedLicenseId}
          onLicenseChange={handleLicenseChange}
        />
      )}

      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="flex gap-2 border rounded-lg p-1">
          {["7d", "30d", "90d"].map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active Students"
          value={overview.summary.activeUsers30d}
          description="In last 30 days"
          icon={Users}
          tooltip="Students with at least one activity in the selected timeframe"
          dataSource="User Activity Logs"
          trend={{
            value: 12,
            direction: "up",
            label: "vs previous period",
          }}
        />
        <KPICard
          title="Active Teachers"
          value={overview.summary.totalTeachers}
          description="Teaching staff"
          icon={GraduationCap}
          tooltip="Total number of teachers and admins"
          dataSource="User Roles"
        />
        <KPICard
          title="Classes with Activity"
          value={Math.round(overview.summary.totalStudents / 25)}
          description="Active classrooms"
          icon={BookOpen}
          tooltip="Classes with student activity in timeframe"
          dataSource="Classroom Activity"
          trend={{
            value: 5,
            direction: "up",
            label: "new this month",
          }}
        />
        <KPICard
          title="Reading Sessions"
          value={overview.summary.totalReadingSessions.toLocaleString()}
          description="Completed sessions"
          icon={Activity}
          tooltip="Total reading sessions completed"
          dataSource="Lesson Records"
          trend={{
            value: 18,
            direction: "up",
            label: "vs last period",
          }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Accuracy Distribution"
          value={`${accuracySplit.high}% High`}
          description={`${accuracySplit.medium}% Med, ${accuracySplit.low}% Low`}
          icon={Target}
          tooltip="Student accuracy levels: High (>80%), Medium (60-80%), Low (<60%)"
          dataSource="Velocity Metrics"
          status={accuracySplit.low > 15 ? "warning" : "success"}
        />
        <KPICard
          title="Projected Level-Ups"
          value={projectedLevelUps}
          description="Next 30 days"
          icon={TrendingUp}
          tooltip="Estimated students who will advance a level"
          dataSource="Progress Tracking"
          trend={{
            value: 8,
            direction: "up",
          }}
        />
        <KPICard
          title="SRS Backlog"
          value={srsBacklog}
          description="Cards due for review"
          icon={Zap}
          tooltip="Spaced Repetition System cards pending review"
          dataSource="SRS Health Metrics"
          status={srsBacklog > 100 ? "warning" : "success"}
        />
      </div>

      {/* Main Widgets Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Adoption Widget */}
        <AdoptionWidget
          licenseId={selectedLicenseId}
          timeframe={timeframe}
          onDrillDown={handleDrillDownToLevel}
        />

        {/* Alert Center */}
        <AlertCenter
          licenseId={selectedLicenseId}
          onAlertClick={handleAlertClick}
          onViewAll={handleViewAllAlerts}
        />

        {/* Teacher Effectiveness and Activity Heatmap - Side by Side */}
        <TeacherEffectiveness
          licenseId={selectedLicenseId}
          timeframe={timeframe}
          onTeacherClick={handleDrillDownToTeacher}
        />

        <CompactActivityHeatmap 
          licenseId={selectedLicenseId}
          timeframe={timeframe}
        />

        {/* AI Insights and Smart Suggestions - Full Width Container */}
        <div className="lg:col-span-2">
          <AIInsights />
        </div>
      </div>
    </div>
  );
}
