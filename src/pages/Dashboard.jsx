import DashboardBarchart from "@/components/Dashboard/DashboardBarChart";
import DashboardPieChart from "@/components/Dashboard/DashboardPieChart";
import { Description, Title } from "@/components/Title";
import DashboardCalendarContextProvider from "@/context/DashCalendarContext";

import { getTotalConsultationsV2 } from "@/services/consultationServices";
import { useQuery } from "@tanstack/react-query";

import DashboardEvents from "@/components/Dashboard/DashboardEvents";
import Loading from "@/components/Loading";

const Dashboard = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getTotalConsultationsV2,
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
      <div className="grid gap-7 pt-9 lg:grid-cols-4">
        {/* Events Calendar - Row 1, Cols 1-3 */}
        <div className="lg:col-span-3">
          <DashboardCalendarContextProvider>
            <DashboardEvents />
          </DashboardCalendarContextProvider>
        </div>
        {/* Insight Panel - Col 4, spans 2 rows */}
        <div className="flex w-full flex-col gap-3 rounded-xl bg-primary p-4 lg:col-start-4 lg:row-span-2">
          <p className="text-lg font-semibold text-accent">Insight</p>
          <div className="rounded-xl bg-white p-4">
            <div className="w-fit rounded-2xl bg-secondary-accent px-3 py-1 text-sm font-bold text-accent">
              <p>Consultation</p>
            </div>
            <p className="my-2 text-xs text-accent">
              {" "}
              You have received{" "}
              <span className="font-bold">{data?.totalResponses}</span>{" "}
              responses on your consultation form as of today.
            </p>
            <p className="my-2 text-xs text-accent">
              The option{" "}
              <span className="font-bold">{data.mostPreferredPreference}</span>{" "}
              is the most preferred by the parishioners with a vote of{" "}
              <span className="font-bold">
                {data?.mostPreferredPercentage}%
              </span>
              .
            </p>

            <p className="my-2 text-xs text-accent">
              Most parishioners prefer to attend the{" "}
              <span className="font-bold">{data.mostPreferredMassTime} </span>
              Mass
            </p>
          </div>
          {/* <div className="rounded-xl bg-white p-4">
            <div className="w-fit rounded-2xl bg-secondary-accent px-3 py-1 text-sm font-bold text-accent">
              <p>Calendar</p>
            </div>
            <p className="my-2 text-xs text-accent">
              {" "}
              You have received{" "}
              <span className="font-bold">{data?.totalResponses}</span> resonses
              on your consultation form as of today.
            </p>
            <p className="my-2 text-xs text-accent">
              The option{" "}
              <span className="font-bold">{data.mostPreferredPreference}</span>{" "}
              is the most preferred by the parishioners with a vote of {}.
            </p>

            <p className="my-2 text-xs text-accent">
              Most parishioners prefer to attend the {}
            </p>
          </div> */}
        </div>
        {/* Pie Chart A - Row 2, Col 1 */}
        <div className="flex-1 overflow-hidden rounded-3xl lg:col-start-1 lg:row-start-2">
          <DashboardPieChart
            firstPercent={data?.preference_a_1st_percentage || 0}
            secondPercent={data?.preference_a_2nd_percentage || 0}
            thirdPercent={data?.preference_a_3rd_percentage || 0}
            firstCount={data?.preference_a_1st_count || 0}
            secondCount={data?.preference_a_2nd_count || 0}
            thirdCount={data?.preference_a_3rd_count || 0}
            preference="A"
            // noResponsePercent={data?.no_response_percentage || 0}
          />
        </div>
        {/* Pie Chart B - Row 2, Col 2 */}
        <div className="flex-1 overflow-hidden rounded-3xl lg:col-start-2 lg:row-start-2">
          <DashboardPieChart
            firstPercent={data?.preference_b_1st_percentage || 0}
            secondPercent={data?.preference_b_2nd_percentage || 0}
            thirdPercent={data?.preference_b_3rd_percentage || 0}
            firstCount={data?.preference_b_1st_count || 0}
            secondCount={data?.preference_b_2nd_count || 0}
            thirdCount={data?.preference_b_3rd_count || 0}
            preference="B"
            // noResponsePercent={data?.no_response_percentage || 0}
          />
        </div>
        {/* Pie Chart C - Row 2, Col 3 */}
        <div className="flex-1 overflow-hidden rounded-3xl lg:col-start-3 lg:row-start-2">
          <DashboardPieChart
            firstPercent={data?.preference_c_1st_percentage || 0}
            secondPercent={data?.preference_c_2nd_percentage || 0}
            thirdPercent={data?.preference_c_3rd_percentage || 0}
            firstCount={data?.preference_c_1st_count || 0}
            secondCount={data?.preference_c_2nd_count || 0}
            thirdCount={data?.preference_c_3rd_count || 0}
            preference="C"
            // noResponsePercent={data?.no_response_percentage || 0}
          />
        </div>
        {/* Bar Chart - Row 3, Cols 1-4 */}
        <div className="flex-1 overflow-hidden rounded-3xl lg:col-span-4 lg:row-start-3">
          <DashboardBarchart
            sixPMCount={data?.sixPMCount}
            eightAMCount={data?.eightAMCount}
            nineThirtyAMCount={data?.nineThirtyAMCount}
            elevenAMCount={data?.elevenAMCount}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
