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
import { useTheme } from "next-themes";
import { CardDescription } from "@/components/ui/card";
import { UserArticleRecord } from "../models/user-article-record-model";
import { QuizStatus } from "../models/questions-model";

// Function to calculate the data for the chart
// This function takes in the articles and the number of days to go back
// It returns an array of objects with the day of the week and the total number of articles read on that day
// Example: [{ day: "Sun 1", total: 5 }, { day: "Mon 2", total: 10 }, ...]

function formatDataForDays(articles: UserArticleRecord[], numDays: number) {
  const today = new Date();
  const specifiedDaysAgo = new Date(
    today.getTime() - numDays * 24 * 60 * 60 * 1000
  );

  const data = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let lastedLevel = 0;
  for (let i = specifiedDaysAgo; i <= today; i.setDate(i.getDate() + 1)) {
    const dayOfWeek = daysOfWeek[i.getDay()];
    const dayOfMonth = i.getDate();

    const filteredArticles = articles.filter((article: UserArticleRecord) => {
      const articleDate = new Date(article.updated_at);
      return articleDate.toDateString() === i.toDateString();
    });

    // get the latest level of the user for that day is the status is completed
    // if level is dosent change then the user didnt complete any article that day return the last user updatedLevel
    let level = lastedLevel;

    for (let j = 0; j < filteredArticles.length; j++) {
      if (filteredArticles[j].status === QuizStatus.COMPLETED_MCQ) {
        level = filteredArticles[j].level;
        lastedLevel = level;
        break;
      }
    }

    data.push({
      day: `${dayOfWeek} ${dayOfMonth}`,
      level,
    });
  }

  return data;
}
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-accent p-3 rounded-md">
        <p className="text-md font-bold">{`${label}`}</p>
        <p className="text-sm">{`User is level ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

interface UserActiviryChartProps {
  data: UserArticleRecord[];
  resGeneralDescription: { message: string; general_description: string };
}
export function UserLevelChart({
  data,
  resGeneralDescription,
}: UserActiviryChartProps) {
  const formattedData = formatDataForDays(data, 7);
  const { theme } = useTheme();

  return (
    <>
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
            <Line dataKey="level" stroke="#fafafa" strokeWidth={3} />
          ) : (
            <Line dataKey="level" stroke="#009688" strokeWidth={3} />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-6">
        <CardDescription>
          {resGeneralDescription.general_description}
        </CardDescription>
      </div>
    </>
  );
}
