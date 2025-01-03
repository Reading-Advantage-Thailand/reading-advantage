"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
import { useTheme } from "next-themes";
import { UserActivityLog } from "../models/user-activity-log-model";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { useScopedI18n } from "@/locales/client";

// Function to calculate the data for the chart
// This function takes in the articles and the number of days to go back
// It returns an array of objects with the day of the week and the total number of articles read on that day
// Example: [{ day: "Sun 1", total: 5 }, { day: "Mon 2", total: 10 }, ...]

function formatDataForDays(
  articles: UserActivityLog[],
  // calendarValue: DateValueType
  lastmonth: number
) {
  // ISO date
  const startDate = new Date();
  const endDate = new Date();

  startDate.setMonth(startDate.getMonth() - lastmonth);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const totalXp: { [key: string]: number } = {};

  for (
    let i = new Date(startDate);
    i <= endDate;
    i.setMonth(i.getMonth() + 1)
  ) {
    const month = `${monthNames[i.getMonth()]} ${i.getFullYear()}`;

    totalXp[month] = 0;
  }

  for (let i = new Date(startDate); i <= endDate; i.setDate(i.getDate() + 1)) {
    const month = `${monthNames[i.getMonth()]} ${i.getFullYear()}`;

    const filteredArticles = articles.filter((article: UserActivityLog) => {
      const articleDate = new Date(article.timestamp);
      articleDate.setHours(0, 0, 0, 0);
      return articleDate.toDateString() === i.toDateString();
    });

    // get the latest level of the user for that day is the status is completed
    // if level is dosent change then the user didnt complete any article that day return the last user updatedLevel

    for (let j = 0; j < filteredArticles.length; j++) {
      if (filteredArticles[j].activityStatus === "completed") {
        if (!totalXp[month] || filteredArticles[j].finalXp > totalXp[month]) {
          totalXp[month] = filteredArticles[j].finalXp;
        }
      }
    }
  }

  // Handle the case where a month has 0 XP
  let lastMonthXp = 0;
  const data = Object.keys(totalXp).map((month) => {
    if (totalXp[month] === 0) {
      totalXp[month] = lastMonthXp;
    } else {
      lastMonthXp = totalXp[month];
    }
    return {
      month: `${month}`,
      xpoverall: totalXp[month],
    };
  });

  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-accent p-3 rounded-md">
        <p className="text-md font-bold">{`${label}`}</p>
        <p className="text-sm">{`${payload[0].value} XP`}</p>
      </div>
    );
  }

  return null;
};

interface UserActiviryChartProps {
  data: UserActivityLog[];
}

const chartConfig = {
  xpoverall: {
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function UserXpOverAllChart({ data }: UserActiviryChartProps) {
  const { resolvedTheme } = useTheme();
  // const [calendarValue, setCalendarValue] = useState<DateValueType>({
  //   startDate: new Date(new Date().setDate(new Date().getDate() - 6)),
  //   endDate: new Date(),
  // });
  const formattedData = formatDataForDays(data, 5);

  const cardDescriptionText = `${formattedData[0]?.month} - ${formattedData[5]?.month}`;
  const t = useScopedI18n("pages.student.reportpage");

  // const handleValueChange = (newValue: DateValueType) => {
  //   setCalendarValue(newValue);
  // };

  return (
    <>
      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle>{t("xpoverall")}</CardTitle>
          <CardDescription>{cardDescriptionText}</CardDescription>
        </CardHeader>
        <CardContent className="pl-16">
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={formattedData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={true} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideIndicator />}
              />
              <Line
                dataKey="xpoverall"
                name="XP"
                type="linear"
                stroke="var(--color-xpoverall)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
          {/* <ResponsiveContainer width="100%" height={350}>
            <LineChart
              accessibilityLayer
              data={formattedData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <Tooltip content={<CustomTooltip />} />
              {resolvedTheme === "dark" ? (
                <Line dataKey="xpoverall" stroke="#fafafa" strokeWidth={3} />
              ) : (
                <Line dataKey="xpoverall" stroke="#009688" strokeWidth={3} />
              )}
            </LineChart>
          </ResponsiveContainer> */}
        </CardContent>
      </Card>
    </>
  );
}
