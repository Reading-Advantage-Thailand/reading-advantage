"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ClassRoomXpChartProps {
  license_id?: string;
}

type TimeRange = "week" | "month" | "year";
type ViewType = "mostActive" | "leastActive";
type XpData = { name: string; xp: number };

export default function ClassRoomXpChart({
  license_id,
}: ClassRoomXpChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [view, setView] = useState<ViewType>("mostActive");
  const [data, setData] = useState<XpData[]>([]);
  const [maxXP, setMaxXP] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchXpData = async () => {
      setLoading(true);
      setError(null);

      try {
        const year = new Date().getFullYear();
        const url = license_id
          ? `/api/v1/classroom/xp-chart?year=${year}&licenseId=${license_id}`
          : `/api/v1/classroom/xp-chart?year=${year}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        const xpData = result.data;
        if (!xpData) throw new Error("No XP data available");

        const key =
          view === "mostActive" ? "dataMostActive" : "dataLeastActive";
        let formattedData: XpData[] = xpData[key]?.[timeRange] || [];

        formattedData.sort((a, b) => b.xp - a.xp);
        setData(formattedData);

        const maxXpValue =
          formattedData.length > 0
            ? Math.max(...formattedData.map((item) => item.xp))
            : 0;
        setMaxXP(maxXpValue);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchXpData();
  }, [timeRange, view, license_id]);

  const buttons = [
    { id: "mostActive" as const, label: "5 Most Active" },
    { id: "leastActive" as const, label: "5 Least Active" },
  ];

  const timeRanges = [
    { id: "week" as const, label: "Week" },
    { id: "month" as const, label: "Month" },
    { id: "year" as const, label: "Year" },
  ];

  const chartConfig = {
    xp: {
      label: "XP",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="col-span-3 p-4 rounded-lg shadow mt-2 mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">
          Class Activity
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex gap-2">
            {buttons.map((button) => (
              <Button
                key={button.id}
                onClick={() => setView(button.id)}
                variant={view === button.id ? "default" : "outline"}
                size="sm"
              >
                {button.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                variant={timeRange === range.id ? "default" : "outline"}
                size="sm"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading data...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">No XP data available</p>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ left: -50, right: 20 }}
              width={500}
              height={300}
              barCategoryGap={"1%"}
            >
              <XAxis
                type="number"
                domain={[0, maxXP]}
                tickFormatter={(value) => `${value.toLocaleString()} XP`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="xp"
                fill="var(--color-xp)"
                radius={[5, 5, 0, 0]}
                barSize={70}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
