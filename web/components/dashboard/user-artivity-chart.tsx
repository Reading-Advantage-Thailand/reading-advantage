"use client"
import { ArticleRecord } from "@/types";
import { RecordStatus } from "@/types/constants";
import { Bar, Line, BarChart, Legend, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

// Function to calculate the data for the chart
// This function takes in the articles and the number of days to go back
// It returns an array of objects with the day of the week and the total number of articles read on that day
// Example: [{ day: "Sun 1", total: 5 }, { day: "Mon 2", total: 10 }, ...]
function formatDataForDays(articles: ArticleRecord[], numDays: number) {
    const today = new Date();
    const specifiedDaysAgo = new Date(today.getTime() - numDays * 24 * 60 * 60 * 1000);

    const data = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = specifiedDaysAgo; i <= today; i.setDate(i.getDate() + 1)) {
        const dayOfWeek = daysOfWeek[i.getDay()];
        const dayOfMonth = i.getDate();

        const filteredArticles = articles.filter((article: ArticleRecord) => {
            const articleDate = new Date(article.createdAt._seconds * 1000);
            return articleDate.toDateString() === i.toDateString();
        });

        const total = filteredArticles.length;

        const articleInfo = filteredArticles.map((article: ArticleRecord) => {
            return `${formatStatusToEmoji(article.status)} ${article.title}`;
        });
        data.push({
            day: `${dayOfWeek} ${dayOfMonth}`,
            total,
            articleInfo,
        });
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
                <p className="text-sm mb-2">
                    {`${payload[0].value} articles read`}
                </p>
                {
                    payload[0].payload.articleInfo.map((info: string, index: number) => {
                        return (
                            <p key={index} className="text-sm text-muted-foreground">
                                {info}
                            </p>
                        )
                    }, [])
                }
            </div>
        );
    }

    return null;
};

interface UserActiviryChartProps {
    data: ArticleRecord[];
}

export function UserActivityChart({
    data,
}: UserActiviryChartProps) {
    const formattedData = formatDataForDays(data, 10);
    return (
        <div>
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
                        cursor={{ fill: 'transparent' }}
                        content={<CustomTooltip />}
                    />
                    <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div className="m-6">
                <p className=" text-sm font-bold">
                    Status
                </p>
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

    )
}