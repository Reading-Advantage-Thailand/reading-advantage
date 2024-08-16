"use client";
import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
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
    color: "hsl(221.2 83.2% 53.3%)",
  },
  sa: {
    color: "hsl(212 95% 68%)",
  },
  la: {
    color: "hsl(216 92% 60%)",
  },
  article_reads: {
    color: "hsl(218 98% 79%)",
  },
  article_rating: {
    color: "hsl(212 97% 87%)",
  },
  sentense_flashcards: {
    color: "hsl(202 96% 86%)",
  },
  vocabulary_flashcards: {
    color: "hsl(222 95% 88%)",
  },
  sentense_activities: {
    color: "hsl(212 95% 68%)",
  },
  vocabulary_activities: {
    color: "hsl(202 85% 68%)",
  },
  level_test: {
    color: "hsl(215 95% 68%)",
  },
} satisfies ChartConfig;

async function fetchActivity() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/activity`
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

  const chartData = activityData.map((element) => {
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
        activity: "Art. rating",
        numberOfTimes: element.totalRatingCount,
        fill: "var(--color-article_rating)",
      },
      {
        activity: "Art. reads",
        numberOfTimes: element.totalReadingCount,
        fill: "var(--color-article_reads)",
      },
      {
        activity: "Voc. flash.",
        numberOfTimes: element.totalVocabularyFlashcardsCount,
        fill: "var(--color-vocabulary_flashcards)",
      },
      {
        activity: "Lev. test",
        numberOfTimes: element.totalLevelTestCount,
        fill: "var(--color-level_test)",
      },
      {
        activity: "Voc. act.",
        numberOfTimes: element.totalVocabularyActivityCount,
        fill: "var(--color-vocabulary_activities)",
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
    ];
  }).flat();

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">
            Activity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full p-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto max-h-[300px] aspect-square [&_.recharts-pie-label-text]:fill-foreground md:w-full "
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent/>} />
              <Pie
                data={chartData}
                dataKey="numberOfTimes"
                nameKey="activity"
                label={(entry) => entry.activity}
                labelLine={true}
                outerRadius="70%"
                >
                </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}


