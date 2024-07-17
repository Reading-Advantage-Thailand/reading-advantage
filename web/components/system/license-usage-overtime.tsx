"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";


export default function LicenseUsageOverTimeChart() {

  return (
    <>
    <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-bold">License Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <input type="date" className="w-full" defaultValue="2023-01-01" />
            <input type="date" className="w-full" defaultValue="2023-12-31" />
            <div className="h-32 flex items-center justify-center">
              Line Chart: License Usage Trend
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
