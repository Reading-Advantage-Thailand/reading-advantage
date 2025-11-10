"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MetricsAlignmentResponse } from "@/types/dashboard";

interface ClassAlignmentMatrixProps {
  classroomId: string;
}

export function ClassAlignmentMatrix({
  classroomId,
}: ClassAlignmentMatrixProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MetricsAlignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const url = `/api/v1/metrics/alignment?classId=${classroomId}&timeframe=90d`;

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[ClassAlignmentMatrix] Error response:", errorText);
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch alignment data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    if (classroomId) {
      fetchData();
    }
  }, [classroomId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CEFR ↔ RA Alignment Matrix</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load alignment data
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.alignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CEFR ↔ RA Alignment Matrix</CardTitle>
          <CardDescription>No alignment data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { alignment, summary } = data;
  const bucketCounts = alignment.buckets?.counts || { aligned: 0, above: 0 };
  const bucketPercentages = alignment.buckets?.percentages || {
    aligned: 0,
    above: 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CEFR ↔ RA Alignment Matrix</CardTitle>
        <CardDescription>
          Alignment score:{" "}
          <Badge variant="outline">
            {Math.round(summary.alignmentScore)}/100
          </Badge>
          {" • "}
          {summary.totalStudents} students with reading activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-3xl font-bold text-green-600">
              {bucketCounts.aligned}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Aligned
            </div>
            <div className="text-lg font-semibold text-green-600 mt-1">
              {bucketPercentages.aligned}%
            </div>
          </div>
          <div className="text-center p-4 border rounded-lg bg-amber-50 dark:bg-amber-950">
            <div className="text-3xl font-bold text-amber-600">
              {bucketCounts.above}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Above Level
            </div>
            <div className="text-lg font-semibold text-amber-600 mt-1">
              {bucketPercentages.above}%
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Level:</span>
              <span className="font-medium">
                {summary.averageLevel.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modal Level:</span>
              <span className="font-medium">{summary.modalLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Readings:</span>
              <span className="font-medium">{summary.totalReadings}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
