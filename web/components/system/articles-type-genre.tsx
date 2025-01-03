"use client";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { genre: "Action and Adventure", fiction: 222 },
  { genre: "Adult Fiction", fiction: 97 },
  { genre: "Children's Fiction", fiction: 59 },
  { genre: "Children's Literature", fiction: 261 },
  { genre: "Classic and Literary Fiction", fiction: 103 },
  { genre: "Contemporary", fiction: 446 },
  { genre: "Crafts and Hobbies", nonFiction: 141 },
  { genre: "Cultural Criticism", nonFiction: 434 },
  { genre: "Drama and Family", nonFiction: 490 },
  { genre: "Essays", nonFiction: 200 },
  { genre: "Adventure and Travel", nonFiction: 120 },
  { genre: "Art and Culture", nonFiction: 260 },
  { genre: "Biographies", nonFiction: 290 },
  { genre: "Business", nonFiction: 340 },
  { genre: "Business and Economics", nonFiction: 180 },
  { genre: "Career Guides", nonFiction: 320 },
];

const fictionData = chartData.filter((item) => item.fiction !== undefined);
const nonFictionData = chartData.filter(
  (item) => item.nonFiction !== undefined
);

const chartConfig = {
  fiction: {
    label: "Fiction",
    color: "hsl(var(--primary))",
  },
  nonFiction: {
    label: "Non Fiction",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type GenreChartProps = {
  data: any;
  dataKey: string;
  config: ChartConfig;
};

const GenreChart = ({ data, dataKey, config }: GenreChartProps) => (
  <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
    <BarChart
      layout="vertical"
      data={data}
      margin={{
        left: 5,
        right: 12,
      }}
    >
      <CartesianGrid horizontal={false} />
      <XAxis type="number" />
      <YAxis dataKey="genre" type="category" width={90} />
      <ChartTooltip
        content={
          <ChartTooltipContent className="w-[150px]" nameKey={dataKey} />
        }
      />
      <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`}>
        <LabelList
          dataKey={dataKey}
          position="right"
          offset={12}
          fontSize={12}
          className="fill-foreground"
        />
      </Bar>
    </BarChart>
  </ChartContainer>
);

export default function ArticlesByTypeAndGenreChart() {
  const total = React.useMemo(
    () => ({
      fiction: fictionData.reduce((acc, curr) => acc + curr.fiction, 0),
      nonFiction: nonFictionData.reduce(
        (acc, curr) => acc + curr.nonFiction,
        0
      ),
    }),
    []
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">
          Articles by Type and Genre
        </CardTitle>
        <div className="flex">
          {["fiction", "nonFiction"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <div
                key={chart}
                className="flex flex-1 flex-col justify-center gap-1 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="">
        <div className="flex">
          <GenreChart
            data={fictionData}
            dataKey="fiction"
            config={chartConfig}
          />
          <GenreChart
            data={nonFictionData}
            dataKey="nonFiction"
            config={chartConfig}
          />
        </div>
      </CardContent>
    </Card>
  );
}
