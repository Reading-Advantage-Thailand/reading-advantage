"use client";
import { ArticleRecord, User } from "@/types";
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
import { useState } from "react";
import { useTheme } from "next-themes";
import { UserActivityLog } from "../models/user-activity-log-model";
import { QuizStatus } from "../models/questions-model";
import { DateField } from "@/components/ui/date-field";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";

// Function to calculate the data for the chart
// This function takes in the articles and the number of days to go back
// It returns an array of objects with the day of the week and the total number of articles read on that day
// Example: [{ day: "Sun 1", total: 5 }, { day: "Mon 2", total: 10 }, ...]

function formatDataForDays(
  articles: UserActivityLog[],
  calendarValue: DateValueType
) {
  // ISO date
  let startDate: Date;
  let endDate: Date;

  if (calendarValue) {
    startDate = calendarValue.startDate
      ? new Date(calendarValue.startDate)
      : new Date();
    endDate = calendarValue.endDate
      ? new Date(calendarValue.endDate)
      : new Date();
  } else {
    // Handle the case when calendarValue is null
    // You can set default values for startDate and endDate here
    startDate = new Date(); // default start date
    endDate = new Date(); // default end date
  }

  startDate.setHours(0, 0, 0, 0); // Set start of the day
  endDate.setHours(23, 59, 59, 999); // Set end of the day

  const data = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let lastedLevel = 0;

  for (let i = new Date(startDate); i <= endDate; i.setDate(i.getDate() + 1)) {
    const dayOfWeek = daysOfWeek[i.getDay()];
    const dayOfMonth = i.getDate();

    const filteredArticles = articles.filter((article: UserActivityLog) => {
      const articleDate = new Date(article.timestamp);
      articleDate.setHours(0, 0, 0, 0);
      return articleDate.toDateString() === i.toDateString();
    });

    // get the latest level of the user for that day is the status is completed
    // if level is dosent change then the user didnt complete any article that day return the last user updatedLevel
    let xpEarned = lastedLevel;

    for (let j = 0; j < filteredArticles.length; j++) {
      if (filteredArticles[j].activityStatus === "completed") {
        xpEarned += filteredArticles[j].xpEarned;
      }
    }

    data.push({
      day: `${dayOfWeek} ${dayOfMonth}`,
      xpEarned,
    });
  }

  return data;
}
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-accent p-3 rounded-md">
        <p className="text-md font-bold">{`${label}`}</p>
        <p className="text-sm">{`User is xpEarned ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

interface UserActiviryChartProps {
  data: UserActivityLog[];
}
export function UserLevelChart({ data }: UserActiviryChartProps) {
  const { theme } = useTheme();
  const [calendarValue, setCalendarValue] = useState<DateValueType>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 6)),
    endDate: new Date(),
  });
  const formattedData = formatDataForDays(data, calendarValue);

  const handleValueChange = (newValue: DateValueType) => {
    setCalendarValue(newValue);
  };

  const inProgressCount = data.filter(
    (item: UserActivityLog) => item.activityStatus === "in_progress"
  ).length;

  const completedCount = data.filter(
    (item: UserActivityLog) => item.activityStatus === "completed"
  ).length;

  return (
    <>
      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle>Activity Progress</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <Card>
            <CardContent className="py-2">
              <CardTitle>In prograss</CardTitle>
              <p className="font-bold text-3xl">{inProgressCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-2">
              <CardTitle>Completed</CardTitle>
              <p className="font-bold text-3xl">{completedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-2">
              <CardTitle>Date Range</CardTitle>
              <DateField
                label=""
                value={calendarValue}
                onChange={handleValueChange}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle>XP Earned</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: any) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {theme === "dark" ? (
                <Line dataKey="xpEarned" stroke="#fafafa" strokeWidth={3} />
              ) : (
                <Line dataKey="xpEarned" stroke="#009688" strokeWidth={3} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
