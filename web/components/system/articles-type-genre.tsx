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


export default function ArticlesByTypeAndGenreChart() {

  return (
    <>
      <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Articles by Type and Genre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="h-40 flex items-center justify-center">
                  Bar Chart: Fiction Genres
                </div>
              </div>
              <div className="flex-1">
                <div className="h-40 flex items-center justify-center">
                  Bar Chart: Non-Fiction Genres
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </>
  );
}
