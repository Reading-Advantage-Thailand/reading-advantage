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


export default function TopSchoolByXPGainedChart() {

  return (
    <>
      <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">Top Schools by XP Gained</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              Bar Chart: School XP Ranking
            </div>
          </CardContent>
        </Card>
    </>
  );
}
