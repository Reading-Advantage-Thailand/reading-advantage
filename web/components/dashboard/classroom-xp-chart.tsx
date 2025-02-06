"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ClassRoomXpChartProps {
  license_id?: string;
}

type TimeRange = "week" | "month" | "year";
type ViewType = "mostActive" | "leastActive";
type XpData = { name: string; xp: number };

export default function ClassRoomXpChart({ license_id }: ClassRoomXpChartProps) {
  const { theme } = useTheme();
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

        const key = view === "mostActive" ? "dataMostActive" : "dataLeastActive";
        let formattedData: XpData[] = xpData[key]?.[timeRange] || [];

        formattedData.sort((a, b) => b.xp - a.xp);
        setData(formattedData);

        const maxXpValue =
          formattedData.length > 0 ? Math.max(...formattedData.map((item) => item.xp)) : 0;
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

  return (
    <Card className="min-h-[500px] col-span-3 p-4 rounded-lg shadow mt-2 mb-4">
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={data}>
              <XAxis
                type="number"
                domain={[0, maxXP]}
                tickFormatter={(value) => `${value.toLocaleString()} XP`}
                axisLine={false}
                tickLine={false}
                stroke={theme === "dark" ? "#fff" : "#000"}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={50}
                axisLine={false}
                tickLine={false}
                stroke={theme === "dark" ? "#fff" : "#000"}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0 && payload[0]) {
                    return (
                      <div
                        className={`p-2 rounded shadow-lg ${
                          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
                        }`}
                      >
                        <p className="font-bold">{`Classroom: ${payload[0].payload.name}`}</p>
                        <p>{`XP: ${payload[0].value?.toLocaleString()} XP`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="xp"
                fill={theme === "dark" ? "#4F46E5" : "#2662d9"}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
