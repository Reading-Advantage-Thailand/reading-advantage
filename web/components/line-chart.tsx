"use client";

import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { UserActivityLog } from "./models/user-activity-log-model";
import { number } from "zod";

// Helper function to get the month name
function getMonthName(date: Date): string {
  return date.toLocaleString("default", { month: "long" });
}

function getLastSixMonths(): string[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.unshift(getMonthName(date));
  }
  return months;
}

const CEFR_LEVEL_MAP: Record<string, number> = {
  "A0-": 0,
  A0: 1,
  "A0+": 2,
  A1: 3,
  "A1+": 4,
  "A2-": 5,
  A2: 6,
  "A2+": 7,
  "B1-": 8,
  B1: 9,
  "B1+": 10,
  "B2-": 11,
  B2: 12,
  "B2+": 13,
  "C1-": 14,
  C1: 15,
  "C1+": 16,
  "C2-": 17,
  C2: 18,
};

const REVERSE_CEFR_LEVEL_MAP: Record<number, string> = {
  0: "A0-",
  1: "A0",
  2: "A0+",
  3: "A1",
  4: "A1+",
  5: "A2-",
  6: "A2",
  7: "A2+",
  8: "B1-",
  9: "B1",
  10: "B1+",
  11: "B2-",
  12: "B2",
  13: "B2+",
  14: "C1-",
  15: "C1",
  16: "C1+",
  17: "C2-",
  18: "C2",
};

function calculateAverageCEFRLevel(
  articles: UserActivityLog[],
  // calendarValue: DateValueType
  lastmonth: number
) {
  console.log("calculateAverageCEFRLevel input:", { articles: articles.length, lastmonth });
  
  // ISO date
  const sixMonthsAgo = new Date();

  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - lastmonth);
  console.log("Filtering from date:", sixMonthsAgo);

  const recentData = articles.filter(
    (item) => new Date(item.timestamp) >= sixMonthsAgo
  );
  console.log("Recent data after date filter:", recentData.length);

  // Check if we have any article read activities
  const articleReadActivities = recentData.filter(activity => 
    activity.activityType === 'ARTICLE_READ' && activity.targetId
  );
  console.log("Article read activities:", articleReadActivities.length);

  // If no article read activities, we can't calculate CEFR level
  if (articleReadActivities.length === 0) {
    console.log("No article read activities found, using default values");
    const months = getLastSixMonths();
    return months.map(month => ({
      month,
      average_cefr_level: "A0-",
      number: 0,
    }));
  }

  // Initialize a default structure with 6 months, default CEFR level set to 0 (A0)
  const monthlyCEFR: Record<string, { total: number; count: number }> = {};
  getLastSixMonths().forEach((month) => {
    monthlyCEFR[month] = { total: CEFR_LEVEL_MAP["A0-"], count: 1 }; // Default to A0 if no data
  });

  /// Aggregate actual data into the structure
  recentData.forEach((item) => {
    // For now, we need to get CEFR level from article data
    // This is a workaround since the activity log doesn't include CEFR level directly
    const cefrLevel = item.details?.cefr_level;
    console.log("Processing item:", { 
      timestamp: item.timestamp, 
      activityType: item.activityType,
      targetId: item.targetId,
      cefrLevel: cefrLevel,
      details: item.details,
      fullItem: item
    });
    
    if (!cefrLevel || !(cefrLevel in CEFR_LEVEL_MAP)) {
      console.log("Skipping invalid CEFR level:", cefrLevel, "Available keys:", Object.keys(CEFR_LEVEL_MAP));
      return; // Skip invalid CEFR levels
    }

    const month = getMonthName(new Date(item.timestamp));
    if (!monthlyCEFR[month]) monthlyCEFR[month] = { total: 0, count: 0 };

    monthlyCEFR[month].total += CEFR_LEVEL_MAP[cefrLevel];
    monthlyCEFR[month].count += 1;
    console.log("Added to month", month, "CEFR:", cefrLevel, "Value:", CEFR_LEVEL_MAP[cefrLevel]);
  });

  console.log("Monthly CEFR totals:", monthlyCEFR);

  // Convert the monthly totals to averages and map to CEFR levels
  const result = Object.entries(monthlyCEFR).map(([month, { total, count }]) => {
    const averageNumeric = total / count;
    const roundedAverage = Math.round(averageNumeric);
    return {
      month,
      average_cefr_level: REVERSE_CEFR_LEVEL_MAP[roundedAverage] || "A0-",
      number: averageNumeric,
    };
  });
  
  console.log("Final result:", result);
  return result;
}

const chartConfig = {
  number: {
    label: "Average CEFR Level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface UserActiviryChartProps {
  data: UserActivityLog[];
}

// Custom Tooltip Content
const CustomTooltip = ({ active, payload, label, nameKey }: any) => {
  if (active && payload && payload.length) {
    const averageCefrLevel =
      REVERSE_CEFR_LEVEL_MAP[Math.round(payload[0].value)];

    return (
      <div className="custom-tooltip">
        <p className="label">{`${nameKey} : ${averageCefrLevel}`}</p>
      </div>
    );
  }

  return null;
};

export default function LineChartCustom({ data }: UserActiviryChartProps) {
  console.log("LineChartCustom received data:", data);
  const formattedData = calculateAverageCEFRLevel(data, 5);
  console.log("LineChartCustom formatted data:", formattedData);

  return (
    <CardContent>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={formattedData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <ChartLegend content={<ChartLegendContent />} />
          <CartesianGrid />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip nameKey="Average CEFR Level" />} />
          <Line
            dataKey="number"
            stroke="var(--color-number)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </CardContent>
  );
}
