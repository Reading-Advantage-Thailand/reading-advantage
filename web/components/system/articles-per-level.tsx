"use client";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
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

interface ArticleLevel {
  data: {
    [key: string]: number;
  };
  [key: string]: any;
}

interface ArticlesPerLevelChartProps {
  articlesPerLevel: ArticleLevel;
}

const chartConfig = {
  articles: {
    label: "Articles",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ArticlesPerLevelChart({
  articlesPerLevel,
}: ArticlesPerLevelChartProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);

  const processData = (data: { [key: string]: number }) => {
    if (!data) return [];
    const processedData = Object.entries(data).map(([key, value]) => ({
      RA_Level: key,
      numberOfArticles: value,
    }));

    processedData.sort((a, b) => {
      const getOrderValue = (RA_Level: string) => {
        if (RA_Level.endsWith("-")) return 0;
        if (RA_Level.endsWith("+")) return 2;
        return 1;
      };

      const extractParts = (RA_Level: string) => {
        const match = RA_Level.match(/(.*?)([-+])?$/);
        return {
          base: match ? match[1] : RA_Level,
          suffix: match && match[2] ? match[2] : "",
        };
      };

      const aParts = extractParts(a.RA_Level);
      const bParts = extractParts(b.RA_Level);

      const baseLevelComparison = aParts.base.localeCompare(
        bParts.base,
        undefined,
        { numeric: true, sensitivity: "base" }
      );
      if (baseLevelComparison !== 0) {
        return baseLevelComparison;
      }

      return getOrderValue(a.RA_Level) - getOrderValue(b.RA_Level);
    });

    setChartData(processedData);
  };

  const handleSendDates = async () => {
    if (startDate && endDate) {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/system/dashboard`
      );

      url.searchParams.append("startDate", startDate);
      url.searchParams.append("endDate", endDate);

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.data && data.data) {
          processData(data.data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("Please select both start and end dates.");
    }
  };

  useEffect(() => {
    if (articlesPerLevel) {
      processData(articlesPerLevel.data);
    } else {
      console.error("Unexpected data structure:", articlesPerLevel);
    }
  }, [articlesPerLevel]);

  useEffect(() => {
    // Fetch new data when date range changes
    if (startDate && endDate) {
      handleSendDates();
    }
  }, [startDate, endDate]);

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setDate: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setDate(event.target.value);
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">
          Articles per Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <input
            type="date"
            className="flex-1/2 border p-2 rounded-sm"
            value={startDate}
            onChange={(e) => handleDateChange(e, setStartDate)}
          />
          <input
            type="date"
            className="flex-1/2 border p-2"
            value={endDate}
            onChange={(e) => handleDateChange(e, setEndDate)}
          />
        </div>
        <ChartContainer config={chartConfig}>
          {chartData.length > 0 ? (
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="RA_Level"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `RA: ${value.slice(0, 3)}`}
              />
              <YAxis domain={[0, "dataMax + 100"]} />{" "}
              <ChartTooltip
                content={<ChartTooltipContent indicator="dashed" />}
                cursor={false}
              />
              <Bar
                dataKey="numberOfArticles"
                fill={chartConfig.articles.color}
                radius={4}
              >
                <LabelList
                  position="top"
                  fontSize={12}
                  className="fill-foreground"
                />
              </Bar>
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No data available
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
