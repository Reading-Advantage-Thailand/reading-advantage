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

const chartData = [
  { activity: "MC", numberOfTimes: 200, fill: "var(--color-mc)" },
  { activity: "SA", numberOfTimes: 287, fill: "var(--color-sa)" },
  { activity: "LA", numberOfTimes: 275, fill: "var(--color-la)" },
  { activity: "sentense flashcards", numberOfTimes: 275, fill: "var(--color-sentense_flashcards)" },
  { activity: "vocabulary flashcards", numberOfTimes: 275, fill: "var(--color-vocabulary_flashcards)" },
  { activity: "Sentense activities ", numberOfTimes: 275, fill: "var(--color-sentense_activities)" },
  { activity: "Vocabulary activities", numberOfTimes: 275, fill: "var(--color-vocabulary_activities)" },
  { activity: "Article reads", numberOfTimes: 275, fill: "var(--color-article_reads)" },
  { activity: "Article rating", numberOfTimes: 275, fill: "var(--color-article_rating)" },
  { activity: "Level test", numberOfTimes: 275, fill: "var(--color-level_test)" },

];

const chartConfig = {
  mc: {
    label: "MC",
    color: "#6366F1",
  },
  sa: {
    label: "SA",
    color: "#D97706",
  },
  la: {
    label: "LA",
    color: "#10B981",
  },
  article_read: {
    label: "Article Reads",
    color: "#e74c3c",
  },
  article_rating: {
    label: "Article Rating",
    color: "#3498db",
  },
  sentense_flashcards: {
    label: "Level Test",
    color: "#9b59b6",
  },
  vocabulary_flashcards: {
    label: "Save Sentence",
    color: "#f1c40f",
  },
  sentense_activities: {
    label: "Save Vocabulary",
    color: "#e67e22",
  },
  vocabulary_activities: {
    label: "Sentence Cloze Test",
    color: "#1abc9c",
  },
  level_test: {
    label: "Sentence Matching",
    color: "#34495e",
  },
} satisfies ChartConfig;

export default function ActivityDistributionPieChart() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.numberOfTimes, 0);
  }, []);

  return (
    <>
       <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="numberOfTimes"
                nameKey="activity"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          {/* <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total number of times activities
                          </tspan> */}
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
