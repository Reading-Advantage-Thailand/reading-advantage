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

interface charData {
  date: string;
  noOfUsers: number;
}

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
  const [chartType, setChartType] = React.useState<"total" | "license">(
    "total"
  );
  const [selectedLicense, setSelectedLicense] = React.useState<
    string | "total"
  >("total");
  const [chartData, setChartData] = React.useState<charData[]>([]);
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

      if (page === "system") {
        const fetchLicenseData = await fetch("/api/v1/licenses", {
          method: "GET",
        });

        const LicenseData = await fetchLicenseData.json();

        setLicenses(LicenseData.data);
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
      }

      setChartData(dataToUse);
    } catch (error) {
      console.error(error);
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
                {licenses.map((license: any, index: number) => (
                  <option key={index} value={license.id}>
                    School Name: {license.school_name}
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
