import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import PropTypes from "prop-types";

export const description = "A pie chart with a label list";

const chartConfig = {
  preference_a: {
    label: "Preference A",
    color: "var(--chart-1)",
  },
  preference_b: {
    label: "Preference B",
    color: "var(--chart-2)",
  },
  preference_c: {
    label: "Preference C",
    color: "var(--chart-3)",
  },

  no_response: {
    label: "No Response",
    color: "var(--chart-5)",
  },
};

const DashboardPieChart = ({
  aPercent,
  bPercent,
  cPercent,
  noResponsePercent,
}) => {
  const chartData = [
    { time: "preference_a", value: aPercent, fill: "hsl(var(--chart-1))" },
    { time: "preference_b", value: bPercent, fill: "hsl(var(--chart-2))" },
    { time: "preference_c", value: cPercent, fill: "hsl(var(--chart-3))" },
    {
      time: "no_response",
      value: noResponsePercent,
      fill: "hsl(var(--chart-5))",
    },
  ];

  return (
    <Card className="h-full justify-between bg-primary">
      <CardHeader className="pb-0">
        <CardTitle className={"text-lg"}>Consultation Results</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex h-full w-full items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background aspect-square h-full flex-1 p-6"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent className={"w-40"} nameKey="time" />
              }
            />
            <Pie data={chartData} dataKey="value">
              {/* <LabelList
                // className="fill-background"
                dataKey="time"
                stroke=" "
                fontSize={20}
                formatter={(value) => chartConfig[value]?.label}
              /> */}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="shadow-[0px_3px_2px_0px_rgba(59, 25, 11, 0.59)] size-4 rounded-md bg-[hsl(var(--chart-1))] shadow-md" />
            <p>Preference A</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-2))]" />
            <p>Preference B</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-3))]" />
            <p>Preference C</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-5))]" />
            <p>No Response</p>
          </div>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
};

DashboardPieChart.propTypes = {
  aPercent: PropTypes.number.isRequired,
  bPercent: PropTypes.number.isRequired,
  cPercent: PropTypes.number.isRequired,
  noResponsePercent: PropTypes.number.isRequired,
};

export default DashboardPieChart;
