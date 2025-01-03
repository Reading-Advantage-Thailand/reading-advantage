"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Pie,
  PieChart,
  XAxis,
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
} from "@/components/ui/chart";

export default function TopSchoolByXPGainedChart() {
  const chartData = [
    { school: "1School", xp: 186 },
    { school: "2School", xp: 305 },
    { school: "3School", xp: 237 },
    { school: "4School", xp: 73 },
    { school: "5School", xp: 209 },
    { school: "6School", xp: 214 },
  ];
  const chartConfig = {
    xp: {
      label: "XP",
      // color: "hsl(var(--chart-1))",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <>
      <Card className="">
        <CardHeader>
          <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">
            Top Schools by XP Gained
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="school"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="xp" fill="var(--color-xp)" radius={8}>
                <LabelList
                  position="top"
                  className="fill-foreground"
                  offset={12}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
