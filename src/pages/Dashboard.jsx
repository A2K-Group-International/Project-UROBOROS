import DashboardBarchart from "@/components/Dashboard/DashboardBarChart";
import DashboardPieChart from "@/components/Dashboard/DashboardPieChart";
import { Description, Title } from "@/components/Title";
import DashboardCalendarContextProvider from "@/context/DashCalendarContext";

import { getTotalConsultations } from "@/services/consultationServices";
import { useQuery } from "@tanstack/react-query";

import DashboardEvents from "@/components/Dashboard/DashboardEvents";
import Loading from "@/components/Loading";

const Dashboard = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getTotalConsultations,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <h1 className="text-2xl font-semibold text-accent">{`${error.message}`}</h1>
      </div>
    );
  }
  return (
    <div className="no-scrollbar mb-3 flex h-full w-full flex-col overflow-y-scroll">
      <Title>Dashboard</Title>
      <Description>Overview of collected data from the system</Description>

      {/* Main Grid Container */}
      <div className="grid h-full grid-cols-1 gap-4 pt-9 md:grid-cols-3 lg:grid-cols-3 lg:gap-7">
        {/* Events Calendar - Takes /3 of the grid width */}
        <div className="md:col-span-3">
          <DashboardCalendarContextProvider>
            <DashboardEvents />
          </DashboardCalendarContextProvider>
        </div>

        {/* Insight Panel - Takes 1/3 of the grid width */}
        {/* <div className="w-full rounded-2xl bg-primary p-4 md:col-span-1 lg:col-span-1">
          <p className="text-lg font-semibold text-accent">Insight</p>
        </div> */}

        {/* Charts Row - Full width in its row */}
        <div className="col-span-1 flex flex-col gap-3 md:col-span-3 lg:col-span-3 lg:flex-row">
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
