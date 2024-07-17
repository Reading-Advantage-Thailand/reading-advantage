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


export default function ActiveUsersChart() {

  return (
    <>
         <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <select className="w-full mb-2">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <div className="h-40 flex items-center justify-center">
              Bar Chart: Active Users Over Time
            </div>
          </CardContent>
        </Card>
    </>
  );
}
