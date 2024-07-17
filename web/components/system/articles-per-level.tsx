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


export default function ArticlesPerLevelChart() {

  return (
    <>
      <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Articles per Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-2">
              <input type="date" className="flex-1" defaultValue="2023-01-01" />
              <input type="date" className="flex-1" defaultValue="2023-12-31" />
            </div>
            <div className="h-40 flex items-center justify-center">
              Bar Chart: Articles per CEFR Level
            </div>
          </CardContent>
        </Card>
    </>
  );
}
