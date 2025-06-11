import DashboardBarchart from "@/components/DashboardBarChart";
import DashboardPieChart from "@/components/DashboardPieChart";
import { Description, Title } from "@/components/Title";

import { getTotalConsultations } from "@/services/consultationServices";
import { useQuery } from "@tanstack/react-query";

import DashboardEvents from "@/components/Dashboard/DashboardEvents";

const Dashboard = () => {
  const { data, _isLoading, _isError, _error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getTotalConsultations,
  });

  return (
    <div className="no-scrollbar mb-3 flex h-full w-full flex-col overflow-y-scroll">
      <Title>Dashboard</Title>
      <Description>Overview of collected data from the system</Description>
      <div className="grid h-full grid-cols-1 grid-rows-[auto] gap-4 pt-9 lg:grid-cols-3 lg:grid-rows-2 lg:gap-7">
        {/* Events Calendar */}
        <DashboardEvents />
        {/* Insight */}
        <div className="col-span-1 w-full rounded-2xl bg-primary p-4 lg:row-span-3">
          <p className="text-lg font-semibold text-accent">Insight</p>
        </div>
        {/* Charts */}
        <div className="col-span-1 flex flex-col gap-3 lg:col-span-2 lg:flex-row">
          <div className="flex-1 overflow-hidden rounded-3xl">
            <DashboardPieChart
              aPercent={data?.preference_a_percentage || 0}
              bPercent={data?.preference_b_percentage || 0}
              cPercent={data?.preference_c_percentage || 0}
              noResponsePercent={data?.no_response_percentage || 0}
            />
          </div>
          <div className="flex-1 overflow-hidden rounded-3xl">
            <DashboardBarchart
              sixPMCount={data?.sixPMCount}
              eightAMCount={data?.eightAMCount}
              nineThirtyAMCount={data?.nineThirtyAMCount}
              elevenAMCount={data?.elevenAMCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
