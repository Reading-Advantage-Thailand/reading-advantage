"use client";
import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
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
    label: "Article reads",
    color: "hsl(218 98% 79%)",
  },
  article_rating: {
    label: "Article rating",
    color: "hsl(212 97% 87%)",
  },
  sentense_flashcards: {
    label: "Sent. flash.",
    color: "hsl(202 96% 86%)",
  },
  vocabulary_flashcards: {
    label: "Vocab. flash.",
    color: "hsl(222 95% 88%)",
  },
  sentense_activities: {
    label: "Sent. act.",
    color: "hsl(212 95% 68%)",
  },
  vocabulary_activities: {
    label: "Vocab. act.",
    color: "hsl(202 85% 68%)",
  },
  level_test: {
    label: "Level test",
    color: "hsl(215 95% 68%)",
  },
} satisfies ChartConfig;

async function fetchActivity() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/activity`
  );

  const data = await response.json();
  return data;
}

export default function ActivityDistributionPieChart() {
  const [activityData, setActivityData] = useState<
    Array<{
      [x: string]: any;
      userId: string;
      activityName: string;
      activityCount: number;
    }>
  >([]);

  useEffect(() => {
    async function loadActivityData() {
      const activity = await fetchActivity();
      setActivityData(activity.userActivityStats);
    }
    loadActivityData();
  }, []);

  const chartData = activityData
    .map((element) => {
      return [
        {
          activity: "MC",
          numberOfTimes: element.totalMcQuestionCount,
          fill: "var(--color-mc)",
        },
        {
          activity: "SA",
          numberOfTimes: element.totalSaQuestionCount,
          fill: "var(--color-sa)",
        },
        {
          activity: "LA",
          numberOfTimes: element.totalLaQuestionCount,
          fill: "var(--color-la)",
        },
        {
          activity: "Vocab. flash.",
          numberOfTimes: element.totalVocabularyFlashcardsCount,
          fill: "var(--color-vocabulary_flashcards)",
        },
        {
          activity: "Sent. flash.",
          numberOfTimes: element.totalSentenceFlashcardsCount,
          fill: "var(--color-sentense_flashcards)",
        },
        {
          activity: "Sent. act.",
          numberOfTimes: element.totalSentenseActivityCount,
          fill: "var(--color-sentense_activities)",
        },
        {
          activity: "Article rating",
          numberOfTimes: element.totalRatingCount,
          fill: "var(--color-article_rating)",
        },
        {
          activity: "Article reads",
          numberOfTimes: element.totalReadingCount,
          fill: "var(--color-article_reads)",
        },
        {
          activity: "Level test",
          numberOfTimes: element.totalLevelTestCount,
          fill: "var(--color-level_test)",
        },
        {
          activity: "Vocab. act.",
          numberOfTimes: element.totalVocabularyActivityCount,
          fill: "var(--color-vocabulary_activities)",
        },
      ];
    })
    .flat();

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
