import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import PropTypes from "prop-types";

export const description = "A pie chart with a label list";

const DashboardPieChart = ({
  firstPercent,
  secondPercent,
  thirdPercent,
  firstCount,
  secondCount,
  thirdCount,
  preference,
  // noResponsePercent,
}) => {
  const chartConfig = {
    count_1: {
      label: "1st Preference Votes",
      color: "var(--chart-1)",
    },
    count_2: {
      label: "1st Preference Votes",
      color: "var(--chart-2)",
    },
    count_3: {
      label: "1st Preference Votes",
      color: "var(--chart-3)",
    },

    // no_response: {
    //   label: "No Response",
    //   color: "var(--chart-5)",
    // },
  };
  const chartData = [
    {
      time: "first",
      count: firstCount,
      value: firstPercent,
      fill: "hsl(var(--chart-1))",
    },
    {
      time: "second",
      count: secondCount,
      value: secondPercent,
      fill: "hsl(var(--chart-2))",
    },
    {
      time: "third",
      count: thirdCount,
      value: thirdPercent,
      fill: "hsl(var(--chart-3))",
    },
    // {
    //   time: "no_response",
    //   value: noResponsePercent,
    //   fill: "hsl(var(--chart-5))",
    // },
  ];

  return (
    <Card className="h-full bg-primary">
      <CardHeader className="pb-0">
        <CardTitle className={"text-lg"}>
          {`Preference ${preference}`}
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background aspect-square h-full flex-1 p-0"
        >
          <PieChart className="h-full w-full">
            {/* <ChartTooltip
              content={
                <ChartTooltipContent
                  className={"w-40"}
                  nameKey="time"
                  valueKey="time"
                />
              }
            /> */}
            <Pie
              data={chartData}
              dataKey="value"
              labelLine={false}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index,
              }) => {
                // Calculate label position
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                const rectWidth = 60;
                const rectHeight = 35;
                const rectX = x - rectWidth / 2;
                const rectY = y - rectHeight / 2;
                const count = chartData[index]?.count ?? 0;

                return (
                  <g>
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectWidth}
                      height={rectHeight}
                      rx={13}
                      fill="#fff"
                    />
                    <text
                      x={x}
                      y={y - 5}
                      textAnchor="middle"
                      fill="#663F30"
                      fontSize={13}
                      fontWeight="bold"
                      alignmentBaseline="middle"
                    >
                      {value} %
                    </text>
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      fill="#663F30"
                      fontSize={11}
                      alignmentBaseline="middle"
                    >
                      {count} votes
                    </text>
                  </g>
                );
              }}
            ></Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="shadow-[0px_3px_2px_0px_rgba(59, 25, 11, 0.59)] size-4 rounded-md bg-[hsl(var(--chart-1))] shadow-md" />
            <p>1st Choice</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-2))]" />
            <p>2nd Choice</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-3))]" />
            <p>3rd Choice</p>
          </div>
          {/* <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-5))]" />
            <p>No Response</p>
          </div> */}
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
  firstPercent: PropTypes.number.isRequired,
  secondPercent: PropTypes.number.isRequired,
  thirdPercent: PropTypes.number.isRequired,
  firstCount: PropTypes.number.isRequired,
  secondCount: PropTypes.number.isRequired,
  thirdCount: PropTypes.number.isRequired,
  // noResponsePercent: PropTypes.number, // Remove required if not used
  preference: PropTypes.string.isRequired,
};

export default DashboardPieChart;
