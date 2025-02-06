"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
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

interface ActiveUsersChartProps {
  page: string;
  license_id?: string;
}

const mockChartData = [
  { date: "2024-04-01", noOfUsers: 222 },
  { date: "2024-04-02", noOfUsers: 97 },
  { date: "2024-04-03", noOfUsers: 167 },
  { date: "2024-04-04", noOfUsers: 242 },
  { date: "2024-04-05", noOfUsers: 373 },
  { date: "2024-04-06", noOfUsers: 301 },
  { date: "2024-04-07", noOfUsers: 245 },
  { date: "2024-04-08", noOfUsers: 409 },
  { date: "2024-04-09", noOfUsers: 59 },
  { date: "2024-04-10", noOfUsers: 261 },
  { date: "2024-04-11", noOfUsers: 327 },
  { date: "2024-04-12", noOfUsers: 292 },
  { date: "2024-04-13", noOfUsers: 342 },
  { date: "2024-04-14", noOfUsers: 137 },
  { date: "2024-04-15", noOfUsers: 120 },
  { date: "2024-04-16", noOfUsers: 138 },
  { date: "2024-04-17", noOfUsers: 446 },
  { date: "2024-04-18", noOfUsers: 364 },
  { date: "2024-04-19", noOfUsers: 243 },
  { date: "2024-04-20", noOfUsers: 89 },
  { date: "2024-04-21", noOfUsers: 137 },
  { date: "2024-04-22", noOfUsers: 224 },
  { date: "2024-04-23", noOfUsers: 138 },
  { date: "2024-04-24", noOfUsers: 387 },
  { date: "2024-04-25", noOfUsers: 215 },
  { date: "2024-04-26", noOfUsers: 75 },
  { date: "2024-04-27", noOfUsers: 383 },
  { date: "2024-04-28", noOfUsers: 122 },
  { date: "2024-04-29", noOfUsers: 315 },
  { date: "2024-04-30", noOfUsers: 454 },
  { date: "2024-05-01", noOfUsers: 165 },
  { date: "2024-05-02", noOfUsers: 293 },
  { date: "2024-05-03", noOfUsers: 247 },
  { date: "2024-05-04", noOfUsers: 385 },
  { date: "2024-05-05", noOfUsers: 481 },
  { date: "2024-05-06", noOfUsers: 498 },
  { date: "2024-05-07", noOfUsers: 388 },
  { date: "2024-05-08", noOfUsers: 149 },
  { date: "2024-05-09", noOfUsers: 227 },
  { date: "2024-05-10", noOfUsers: 293 },
  { date: "2024-05-11", noOfUsers: 335 },
  { date: "2024-05-12", noOfUsers: 197 },
  { date: "2024-05-13", noOfUsers: 197 },
  { date: "2024-05-14", noOfUsers: 448 },
  { date: "2024-05-15", noOfUsers: 473 },
  { date: "2024-05-16", noOfUsers: 338 },
  { date: "2024-05-17", noOfUsers: 499 },
  { date: "2024-05-18", noOfUsers: 315 },
  { date: "2024-05-19", noOfUsers: 235 },
  { date: "2024-05-20", noOfUsers: 177 },
  { date: "2024-05-21", noOfUsers: 82 },
  { date: "2024-05-22", noOfUsers: 81 },
  { date: "2024-05-23", noOfUsers: 252 },
  { date: "2024-05-24", noOfUsers: 294 },
  { date: "2024-05-25", noOfUsers: 201 },
  { date: "2024-05-26", noOfUsers: 213 },
  { date: "2024-05-27", noOfUsers: 420 },
  { date: "2024-05-28", noOfUsers: 233 },
  { date: "2024-05-29", noOfUsers: 78 },
  { date: "2024-05-30", noOfUsers: 340 },
  { date: "2024-05-31", noOfUsers: 178 },
  { date: "2024-06-01", noOfUsers: 178 },
  { date: "2024-06-02", noOfUsers: 470 },
  { date: "2024-06-03", noOfUsers: 103 },
  { date: "2024-06-04", noOfUsers: 439 },
  { date: "2024-06-05", noOfUsers: 88 },
  { date: "2024-06-06", noOfUsers: 294 },
  { date: "2024-06-07", noOfUsers: 323 },
  { date: "2024-06-08", noOfUsers: 385 },
  { date: "2024-06-09", noOfUsers: 438 },
  { date: "2024-06-10", noOfUsers: 155 },
  { date: "2024-06-11", noOfUsers: 92 },
  { date: "2024-06-12", noOfUsers: 492 },
  { date: "2024-06-13", noOfUsers: 81 },
  { date: "2024-06-14", noOfUsers: 426 },
  { date: "2024-06-15", noOfUsers: 307 },
  { date: "2024-06-16", noOfUsers: 371 },
  { date: "2024-06-17", noOfUsers: 475 },
  { date: "2024-06-18", noOfUsers: 107 },
  { date: "2024-06-19", noOfUsers: 341 },
  { date: "2024-06-20", noOfUsers: 408 },
  { date: "2024-06-21", noOfUsers: 169 },
  { date: "2024-06-22", noOfUsers: 317 },
  { date: "2024-06-23", noOfUsers: 480 },
  { date: "2024-06-24", noOfUsers: 132 },
  { date: "2024-06-25", noOfUsers: 141 },
  { date: "2024-06-26", noOfUsers: 434 },
  { date: "2024-06-27", noOfUsers: 448 },
  { date: "2024-06-28", noOfUsers: 149 },
  { date: "2024-06-29", noOfUsers: 103 },
  { date: "2024-06-30", noOfUsers: 446 },
];
const chartConfig = {
  views: {
    label: "Active Users",
  },
  noOfUsers: {
    label: "noOfUsers",
    color: "hsl(var(--primary))",
    // color: "hsl(221.2 83.2% 53.3%)",
  },
} satisfies ChartConfig;

export default function ActiveUsersChart({
  page,
  license_id,
}: ActiveUsersChartProps) {
  const [timeRange, setTimeRange] = React.useState("Daily");
  const [chartType, setChartType] = React.useState<"total" | "license">("total");
  const [selectedLicense, setSelectedLicense] = React.useState<string | "total">("total");
  const [chartData, setChartData] = React.useState(mockChartData);
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("noOfUsers");
  const [licenses, setLicenses] = React.useState<string[]>([]);

  const fetchActiveChart = React.useCallback(async () => {
    try {
      let apiUrl = `/api/v1/activity/active-users`;
      const res = await fetch(apiUrl, { method: "GET" });

      if (!res.ok) throw new Error("Failed to fetch User activity");

      const fetchData = await res.json();
      if (!fetchData || typeof fetchData !== "object") {
        throw new Error("Invalid API response format");
      }

      let dataToUse: { date: string; noOfUsers: number }[] = [];

      if (page === "admin" && license_id) {
        dataToUse = fetchData.licenses?.[license_id] || [];
      } else {
        if (selectedLicense === "total") {
          dataToUse = fetchData.total || [];
        } else {
          dataToUse = fetchData.licenses?.[selectedLicense] || [];
        }

        if (fetchData.licenses) {
          setLicenses(Object.keys(fetchData.licenses));
        }
      }

      setChartData(dataToUse);
    } catch (error) {
      console.error(error);
      setChartData(mockChartData);
    }
  }, [page, license_id, selectedLicense]);

  React.useEffect(() => {
    fetchActiveChart();
  }, [fetchActiveChart]);

  const filterChartData = () => {
    switch (timeRange) {
      case "Weekly":
        return chartData.slice(-7);
      case "Monthly":
        return chartData.slice(-30);
      default:
        return chartData;
    }
  };

  return (
    <>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">
            Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {page === "system" && (
            <div className="flex justify-between mb-2">
              <select
                className="p-1 border rounded-md"
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
              >
                <option value="total">Total Users</option>
                {licenses.map((license) => (
                  <option key={license} value={license}>
                    License: {license}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between mb-2">
            <select
              className="p-1 border rounded-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={filterChartData()}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}

