"use client";
import { ArticleRecord } from "@/types";
import { RecordStatus } from "@/types/constants";
import {
  Bar,
  Line,
  BarChart,
  Legend,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import React, { useState } from "react";
import { DateField } from "@/components/ui/date-field";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";
import { useTheme } from "next-themes";

// Function to calculate the data for the chart
// This function takes in the articles and the number of days to go back
// It returns an array of objects with the day of the week and the total number of articles read on that day
// Example: [{ day: "Sun 1", total: 5 }, { day: "Mon 2", total: 10 }, ...]
function formatDataForDays(articles: ArticleRecord[], calendarValue: DateValueType) {
  let startDate: Date;
  let endDate: Date;

  if (calendarValue) {
    startDate = calendarValue.startDate ? new Date(calendarValue.startDate) : new Date();
    endDate = calendarValue.endDate ? new Date(calendarValue.endDate) : new Date();
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

  for (let i = new Date(startDate); i <= endDate; i.setDate(i.getDate() + 1)) {
    const dayOfWeek = daysOfWeek[i.getDay()];
    const dayOfMonth = i.getDate();

   const filteredArticles = articles.filter((article: ArticleRecord) => {
      const articleDate = new Date(article.createdAt._seconds * 1000);
      articleDate.setHours(0, 0, 0, 0); // Compare only the date part
      return articleDate.getTime() === i.getTime();
    });

    const total = filteredArticles.length;
    const articleInfo = filteredArticles.map(article => `${formatStatusToEmoji(article.status)} ${article.title}`);

    data.push({ day: `${dayOfWeek} ${dayOfMonth}`, total, articleInfo });
  }

   return data;
}

function formatStatusToEmoji(status: RecordStatus) {
  switch (status) {
    case "completed":
      return "🟢";
    case "unrated":
      return "🔴";
    case "uncompletedShortAnswer":
      return "🟡";
    case "uncompletedMCQ":
      return "🟠";
    default:
      return "";
  }
}
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-accent p-3 rounded-md">
        <p className="text-md font-bold">{`${label}`}</p>
        <p className="text-sm mb-2">{`${payload[0].value} articles read`}</p>
        {payload[0].payload.articleInfo.map((info: string, index: number) => {
          return (
            <p key={index} className="text-sm text-muted-foreground">
              {info}
            </p>
          );
        }, [])}
      </div>
    );
  }

  return null;
};

interface UserActiviryChartProps {
  data: ArticleRecord[];
}

export function UserActivityChart({ data }: UserActiviryChartProps) {  
   const { theme } = useTheme();
  const [calendarValue, setCalendarValue] = useState<DateValueType>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 6)),
    endDate: new Date(),
  });

  const handleValueChange = (newValue: DateValueType) => {
    setCalendarValue(newValue);
  };

  const formattedData = formatDataForDays(data, calendarValue);

  return (
    <div>
      <div className="relative w-full px-4 mb-4">
        <DateField
          label="Date"
          value={calendarValue}
          onChange={handleValueChange}
        />
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={formattedData}>
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
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={<CustomTooltip />}
          />        
          {theme === "dark" ? (

            <Bar dataKey="total" fill="#fafafa" radius={[4, 4, 0, 0]} />
          ) : (

            <Bar dataKey="total" fill="#009688" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
      <div className="m-6">
        <p className=" text-sm font-bold">Status</p>
        <div className="text-xs text-muted-foreground mt-2">
          <div className="flex items-center">
            <p>🟢 Completed</p>
          </div>
          <div className="flex items-center">
            <p>🟠 Uncompleted Short Answer</p>
          </div>
          <div className="flex items-center">
            <p>🟡 Uncompleted MCQ</p>
          </div>
          <div className="flex items-center">
            <p>🔴 Unrated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
