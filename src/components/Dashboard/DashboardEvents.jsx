import DashboardCalendarContextProvider from "@/context/DashCalendarContext";
import useEventCalendar from "@/hooks/useEventCalendar";
import { Calendar } from "@/components/ui/calendar";

const DashboardEvents = () => {
  const { _activeDate, _handleDateChange } = useEventCalendar();
  return (
    <div className="col-span-1 rounded-2xl bg-primary p-4 lg:col-span-2 lg:row-span-2">
      <p className="pb-3 font-semibold text-accent">Events Calendar</p>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="h-full flex-1 rounded-xl bg-white">
          <Calendar isMulti={false} />
        </div>
        <div className="flex-1 rounded-xl bg-white"></div>
      </div>
    </div>
  );
};

const index = () => {
  return (
    <DashboardCalendarContextProvider>
      <DashboardEvents />
    </DashboardCalendarContextProvider>
  );
};

export default index;
