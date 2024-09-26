"use client";
import React from "react";
import { useTheme } from "next-themes";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserActivityLog } from "../models/user-activity-log-model";
import { useScopedI18n } from "@/locales/client";

const chartConfig = {
  // inProgress: {
  //   label: "inProgress",
  //   color: "hsl(var(--chart-1))",
  // },
  // Completed: {
  //   label: "Completed",
  //   color: "hsl(var(--chart-2))",
  // },
} satisfies ChartConfig;

interface UserActiviryChartProps {
  data: UserActivityLog[];
}

const ReadingStatsChart = ({ data }: UserActiviryChartProps) => {
  const { resolvedTheme } = useTheme();
  const [seletedValue, setSeletedValue] = React.useState<string>("type");
  const t = useScopedI18n("pages.student.reportpage");
  const formatData = (value: UserActivityLog[], selected: string) => {
    const filterArtcileRead = value.filter(
      (item) => item.activityType === "article_read"
    );

    const result: Record<string, { inProgress: number; completed: number }> =
      {};

    filterArtcileRead.forEach((item) => {
      const key = item.details[selected as keyof typeof item.details] as string;

      // Skip if key is undefined or empty
      if (!key) return;

      const status =
        item.activityStatus === "completed" ? "completed" : "inProgress";

      if (!result[key]) {
        result[key] = { inProgress: 0, completed: 0 };
      }

      result[key][status]++;
    });

    return Object.keys(result)
      .filter((category) => category) // Remove undefined or empty categories
      .map((category) => ({
        category,
        inProgressRead: result[category].inProgress,
        completedRead: result[category].completed,
      }));
  };

  const getData = formatData(data, seletedValue);

  const handleSeletedChange = (value: string) => {
    setSeletedValue(value);
  };
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>{t("readingstatschart")}</CardTitle>
        </div>
        <Select onValueChange={handleSeletedChange} defaultValue="type">
          <SelectTrigger className="w-[180px]">
            <CardTitle>Selected</CardTitle>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="Default">Default</SelectItem> */}
            <SelectItem value="type">Type</SelectItem>
            <SelectItem value="genre">Genre</SelectItem>
            <SelectItem value="subgenre">Subgenre</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={getData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              stroke="#888888"
              tickMargin={10}
              tickLine={false}
              axisLine={false}
              tick={false}
              // tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelClassName="capitalize"
                  indicator="dashed"
                />
              }
            />
            {resolvedTheme === "dark" ? (
              <>
                <Bar dataKey="inProgressRead" fill="#fafafa" radius={8} />
                <Bar dataKey="completedRead" fill="#009688" radius={8} />
              </>
            ) : (
              <>
                <Bar
                  dataKey="inProgressRead"
                  fill="var(--color-mobile)"
                  radius={8}
                />
                <Bar dataKey="completedRead" fill="#009688" radius={8} />
              </>
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ReadingStatsChart;
