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


export default function LicenseUsageChart() {

  return (
    <>
     {/* License Usage */}
     <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-bold">License Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            Gauge Chart: 70% Used
          </div>
        </CardContent>
      </Card>
    </>
  );
}
