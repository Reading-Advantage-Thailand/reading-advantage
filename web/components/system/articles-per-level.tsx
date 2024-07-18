"use client";
import React, { use, useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

interface ArticleLevel {
 data: {};
 articlesPerLevel: {
  data: {
    [key: string]: number;
  };
  }
 }

interface ArticlesPerLevelChartProps {
  articlesPerLevel: ArticleLevel;
}

const chartConfig = {
  articles: {
    label: "Articles",
    color: "#1D4ED8",
  },
} satisfies ChartConfig;


export default async function ArticlesPerLevelChart(articlesPerLevel: ArticlesPerLevelChartProps) {
const dataResponse = articlesPerLevel.articlesPerLevel.data;

const chartData = Object.entries(dataResponse).map(([key, value]) => ({
    CEFR_Level: key,
    numberOfArticles: value,
  }));

chartData.sort((a, b) => {
  const getOrderValue = (cefr_Level: string) => {
    if (cefr_Level.endsWith('-')) return 0;
    if (cefr_Level.endsWith('+')) return 2;
    return 1; 
  };

  const extractParts = (cefr_Level: string) => {
    const match = cefr_Level.match(/(.*?)([-+])?$/);
    return {
      base: match ? match[1] : cefr_Level, 
      suffix: match && match[2] ? match[2] : ''
    };
  };

  const aParts = extractParts(a.CEFR_Level);
  const bParts = extractParts(b.CEFR_Level);

  const baseLevelComparison = aParts.base.localeCompare(bParts.base, undefined, {numeric: true, sensitivity: 'base'});
  if (baseLevelComparison !== 0) {
    return baseLevelComparison;
  }

  return getOrderValue(a.CEFR_Level) - getOrderValue(b.CEFR_Level);
});

  return (
    <>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Articles per Level
          </CardTitle>
          <CardDescription>January - December 2023</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-2">
            <input
              type="date"
              className="flex-1/2 border p-2 rounded-sm"
              defaultValue="2023-01-01"
            />
            <input
              type="date"
              className="flex-1/2 border p-2"
              defaultValue="2023-12-31"
            />
          </div>
          <div className="h-40 flex items-center justify-center">
            Bar Chart: Articles per CEFR Level
          </div>
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="CEFR_Level"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="dashed" />}
                cursor={false}
              />
              <Bar
                dataKey="numberOfArticles"
                fill={chartConfig.articles.color}
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Showing total articles for the selected period
          </div>  
        </CardFooter>
      </Card>
    </>
  );
}
