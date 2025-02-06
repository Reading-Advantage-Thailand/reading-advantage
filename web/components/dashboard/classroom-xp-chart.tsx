"use client";

import React, { useState } from "react";
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

type TimeRange = "week" | "month" | "year";
type ViewType = "mostActive" | "leastActive";

interface ClassData {
  name: string;
  xp: number;
}

interface DataByTimeRange {
  week: ClassData[];
  month: ClassData[];
  year: ClassData[];
}

export default function ClassRoomXpChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [view, setView] = useState<ViewType>("mostActive");

  const dataMostActive: DataByTimeRange = {
    week: [
      { name: "Class A", xp: 85000 },
      { name: "Class B", xp: 75000 },
      { name: "Class C", xp: 65000 },
      { name: "Class D", xp: 55000 },
      { name: "Class E", xp: 45000 },
    ],
    month: [
      { name: "Class A", xp: 340000 },
      { name: "Class B", xp: 300000 },
      { name: "Class C", xp: 260000 },
      { name: "Class D", xp: 220000 },
      { name: "Class E", xp: 180000 },
    ],
    year: [
      { name: "Class A", xp: 4080000 },
      { name: "Class B", xp: 3600000 },
      { name: "Class C", xp: 3120000 },
      { name: "Class D", xp: 2640000 },
      { name: "Class E", xp: 2160000 },
    ],
  };

  const dataLeastActive: DataByTimeRange = {
    week: [
      { name: "Class X", xp: 15000 },
      { name: "Class Y", xp: 12000 },
      { name: "Class Z", xp: 10000 },
      { name: "Class W", xp: 8000 },
      { name: "Class V", xp: 5000 },
    ],
    month: [
      { name: "Class X", xp: 60000 },
      { name: "Class Y", xp: 48000 },
      { name: "Class Z", xp: 40000 },
      { name: "Class W", xp: 32000 },
      { name: "Class V", xp: 20000 },
    ],
    year: [
      { name: "Class X", xp: 720000 },
      { name: "Class Y", xp: 576000 },
      { name: "Class Z", xp: 480000 },
      { name: "Class W", xp: 384000 },
      { name: "Class V", xp: 240000 },
    ],
  };

  const data = view === "mostActive" 
    ? dataMostActive[timeRange] 
    : dataLeastActive[timeRange];

  const maxXP = Math.max(
    ...dataMostActive[timeRange].map(item => item.xp),
    ...dataLeastActive[timeRange].map(item => item.xp)
  );

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

        <ResponsiveContainer width="100%" height={300}>
          <BarChart layout="vertical" data={data}>
            <XAxis
              type="number"
              domain={[0, maxXP]}
              tickFormatter={(value) => `${value.toLocaleString()} XP`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0 && payload[0]) {
                  return (
                    <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
                      <p className="font-bold">{`Classroom: ${payload[0].payload.name}`}</p>
                      <p>{`XP: ${payload[0].value?.toLocaleString()} XP`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="xp" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}