"use client";
import React, { useEffect, useState } from "react";
import '@/styles/globals.css';
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, ResponsiveContainer } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { activity: "MC", numberOfTimes: 200, fill: "var(--color-mc)" },
  { activity: "SA", numberOfTimes: 287, fill: "var(--color-sa)" },
  { activity: "LA", numberOfTimes: 275, fill: "var(--color-la)" },
  {
    activity: "sent. flash.",
    numberOfTimes: 275,
    fill: "var(--color-sentense_flashcards)",
  },
  {
    activity: "vocab. flash.",
    numberOfTimes: 275,
    fill: "var(--color-vocabulary_flashcards)",
  },
  {
    activity: "Sent. act.",
    numberOfTimes: 275,
    fill: "var(--color-sentense_activities)",
  },
  {
    activity: "Vocab. act.",
    numberOfTimes: 275,
    fill: "var(--color-vocabulary_activities)",
  },
  {
    activity: "Article reads",
    numberOfTimes: 275,
    fill: "var(--color-article_reads)",
  },
  {
    activity: "Article rating",
    numberOfTimes: 275,
    fill: "var(--color-article_rating)",
  },
  {
    activity: "Level test",
    numberOfTimes: 275,
    fill: "var(--color-level_test)",
  },
];

const chartConfig = {
  mc: {
    label: "MC",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  sa: {
    label: "SA",
    color: "hsl(212 95% 68%)",
  },
  la: {
    label: "LA",
    color: "hsl(216 92% 60%)",
  },
  article_reads: {
    label: "Article Reads",
    color: "hsl(218 98% 79%)",
  },
  article_rating: {
    label: "Article Rating",
    color: "hsl(212 97% 87%)",
  },
  sentense_flashcards: {
    label: "Level Test",
    color: "hsl(202 96% 86%)",
  },
  vocabulary_flashcards: {
    label: "Save Sentence",
    color: "hsl(222 95% 88%)",
  },
  sentense_activities: {
    label: "Save Vocabulary",
    color: "hsl(212 95% 68%)",
  },
  vocabulary_activities: {
    label: "Sentence Cloze Test",
    color: "hsl(202 85% 68%)",
  },
  level_test: {
    label: "Sentence Matching",
    color: "hsl(215 95% 68%)",
  },
} satisfies ChartConfig;

export default function ActivityDistributionPieChart() {
  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">
            Activity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="w-full max-h-[350px] [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="numberOfTimes"
                nameKey="activity"
                label={(entry) => entry.activity}
                labelLine={true}
                outerRadius="80%"
              />
            </PieChart>
          </ChartContainer>

{/* <ChartContainer
          config={chartConfig}
          className="w-full h-[200px] sm:h-[300px] md:h-[350px] [&_.recharts-pie-label-text]:fill-foreground"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="numberOfTimes"
                nameKey="activity"
                label={(entry) => entry.activity}
                labelLine={true}
                outerRadius="80%"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer> */}
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-8 text-sm">
          <div className="leading-none text-muted-foreground hidden sm:block md:block lg:block">
            Showing the distribution of activities
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
