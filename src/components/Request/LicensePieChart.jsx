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
import useLicense from "@/hooks/useLicense";
import { Loader2 } from "lucide-react";

export const description = "A pie chart with a label list";

const LicensePieChart = () => {
  const {
    totalLicenses,
    isTotalLicensesLoading,
    activeLicensesCount,
    isActiveLicensesLoading,
    inactiveLicensesCount,
    isInactiveLicensesLoading,
  } = useLicense({});

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
      count: activeLicensesCount,
      fill: "hsl(var(--chart-1))",
    },

    {
      status: "inactive",
      count: inactiveLicensesCount,
      fill: "hsl(var(--chart-3))",
    },
  ];

  if (
    isTotalLicensesLoading ||
    isActiveLicensesLoading ||
    isInactiveLicensesLoading
  ) {
    return (
      <Card className="h-full rounded-3xl border-none bg-primary">
        <CardHeader className="pb-0">
          <CardTitle className="sr-only">
            Chart for number of licenses
          </CardTitle>
          <CardDescription className="sr-only">
            Chart for number of licenses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-72 items-center justify-center">
          <p className="text-muted-foreground">
            <Loader2 className="animate-spin" />
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-3xl border-none bg-primary">
      <CardHeader className="pb-0">
        <CardTitle className="sr-only">Chart for number of licenses</CardTitle>
        <CardDescription className="sr-only">
          Chart for number of licenses
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col items-center pb-0 md:h-96 md:flex-row">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background aspect-square h-[290px] flex-1 p-0"
        >
          <PieChart className="h-full w-full">
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
                      fill="rgba(255, 255, 255, 0.75)"
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
            <p className="text-3xl">{totalLicenses}</p>
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
        </div>
      </CardContent>
    </Card>
  );
};

LicensePieChart.propTypes = {
  inactiveCount: PropTypes.number.isRequired,
  activeCount: PropTypes.number.isRequired,
  totalLicense: PropTypes.number,
};

export default LicensePieChart;
