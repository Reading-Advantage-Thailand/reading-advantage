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
  inProgress: {
    label: "inProgress",
    color: "hsl(var(--primary))",
  },
  Completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
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
      (item) =>
        item.activityType === "article_read" ||
        item.activityType === "lesson_read"
    );
    const articleMap = new Map<string, UserActivityLog>();

    filterArtcileRead.forEach((item) => {
      const articleId =
        (item as any).articleId ||
        (item as any).contentId ||
        (item.details as any)?.articleId ||
        (item.details as any)?.contentId ||
        undefined;
      if (!articleId) return;

      const existing = articleMap.get(articleId);
      if (
        !existing ||
        (existing.activityStatus !== "completed" &&
          item.activityStatus === "completed")
      ) {
        articleMap.set(articleId, item);
      }
    });
    const result: Record<string, { inProgress: number; completed: number }> =
      {};

    Array.from(articleMap.values()).forEach((item) => {
      const key = item.details[selected as keyof typeof item.details] as string;
      if (!key) return;

      const status =
        item.activityStatus === "completed" ? "completed" : "inProgress";

      if (!result[key]) {
        result[key] = { inProgress: 0, completed: 0 };
      }

      result[key][status]++;
    });

    const formattedData = Object.keys(result)
      .filter((category) => category)
      .map((category) => ({
        category,
        inProgressRead: result[category].inProgress,
        completedRead: result[category].completed,
      }));

    return formattedData;
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
            <Bar
              dataKey="inProgressRead"
              fill="var(--color-inProgress)"
              name={t("inProgress")}
              radius={8}
            />
            <Bar
              dataKey="completedRead"
              fill="var(--color-Completed)"
              name={t("completed")}
              radius={8}
            />
            {/* {resolvedTheme === "dark" ? (
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
            )} */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ReadingStatsChart;
