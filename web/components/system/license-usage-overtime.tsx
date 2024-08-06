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
    <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">License Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 lg:max-h-[400px]">
            <input type="date" className="w-full sm:w-1/2 md:w-1/2 lg:w-1/2" defaultValue="2023-01-01" />
            <input type="date" className="w-full sm:w-1/2 md:w-1/2 lg:w-1/2" defaultValue="2023-12-31" />
            <div className="h-32 sm:h-48 md:h-64 flex items-center justify-center">
              Line Chart: License Usage Trend
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
