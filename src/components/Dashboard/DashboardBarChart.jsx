import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import PropTypes from "prop-types";

export const description = "A bar chart";

const chartConfig = {
  "6.00pm": {
    label: "6.00pm",
    color: "hsl(var(--chart-1))",
  },
  "8.00am": {
    label: "8.00am",
    color: "hsl(var(--chart-1))",
  },
  "9.30am": {
    label: "9.30am",
    color: "hsl(var(--chart-1))",
  },
  "11.00am": {
    label: "11.00am",
    color: "hsl(var(--chart-1))",
  },
};
const DashboardBarchart = ({
  nineThirtyAMCount,
  elevenAMCount,
  sixPMCount,
  eightAMCount,
}) => {
  const chartData = [
    { time: "6.00pm", value: sixPMCount || 0 },
    { time: "8.00am", value: eightAMCount || 0 },
    { time: "9.30am", value: nineThirtyAMCount || 0 },
    { time: "11.00am", value: elevenAMCount || 0 },
  ];

  return (
    <Card className="flex h-full flex-col justify-between bg-primary">
      <CardHeader>
        <CardTitle className="text-lg">Mass Attendance Preference</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-grow overflow-x-scroll p-0">
        <ChartContainer className={"h-[80%]"} config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            {/* <CartesianGrid vertical={false} /> */}
            <YAxis
              className="bg-accent font-semibold text-accent"
              axisLine={true}
              tickLine={true}
              tickMargin={4}
              tick={{ fill: "#663F30" }}
            />
            <XAxis
              className="text-sm font-semibold text-accent"
              dataKey="time"
              tickLine={false}
              tickMargin={10}
              axisLine={true}
              tick={{ fill: "#663F30" }}
              //   tickFormatter={(value) => value.slice(0, 20)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              className="relative"
              dataKey="value"
              fill="var(--color-value)"
              radius={[12, 12, 0, 0]}
            >
              <div>
                <p></p>
              </div>
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 border-none text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
};

DashboardBarchart.propTypes = {
  nineThirtyAMCount: PropTypes.number,
  elevenAMCount: PropTypes.number,
  sixPMCount: PropTypes.number,
  eightAMCount: PropTypes.number,
};

export default DashboardBarchart;
