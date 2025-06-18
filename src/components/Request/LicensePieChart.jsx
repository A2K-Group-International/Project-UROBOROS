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

const LicensePieChart = ({
  totalLicense = 300,
  inactiveCount,
  activeCount,
}) => {
  const chartConfig = {
    active: {
      label: "Active User License",
      color: "var(--chart-1)",
    },
    inactive: {
      label: "Inactive User License",
      color: "var(--chart-3)",
    },

    // no_response: {
    //   label: "No Response",
    //   color: "var(--chart-5)",
    // },
  };
  const chartData = [
    {
      status: "active",
      count: activeCount,
      fill: "hsl(var(--chart-1))",
    },

    {
      status: "inactive",
      count: inactiveCount,
      fill: "hsl(var(--chart-3))",
    },
    // {
    //   time: "no_response",
    //   value: noResponsePercent,
    //   fill: "hsl(var(--chart-5))",
    // },
  ];

  return (
    <Card className="h-full rounded-3xl border-none bg-primary">
      <CardHeader className="pb-0">
        <CardTitle className={"text-lg"}></CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex h-72 items-center pb-0">
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
              dataKey="count"
              labelLine={false}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
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
                      y={y}
                      textAnchor="middle"
                      fill="#663F30"
                      fontSize={13}
                      fontWeight="bold"
                      alignmentBaseline="middle"
                    >
                      {value}
                    </text>
                  </g>
                );
              }}
            ></Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-1 flex-col gap-3">
          <div className="mb-8 font-bold text-accent">
            <p className="text-3xl">{totalLicense}</p>
            <p className="text-muted-foreground text-sm">Total Licenses</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-1))] shadow-md shadow-black/60" />
            <p className="text-xs font-semibold text-accent">Active</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[hsl(var(--chart-3))] shadow-md shadow-black/60" />
            <p className="text-xs font-semibold text-accent">Inactive</p>
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

LicensePieChart.propTypes = {
  inactiveCount: PropTypes.number.isRequired,
  activeCount: PropTypes.number.isRequired,
  totalLicense: PropTypes.number,
};

export default LicensePieChart;
