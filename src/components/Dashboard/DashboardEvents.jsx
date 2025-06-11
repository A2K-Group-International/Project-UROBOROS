import useEventCalendar from "@/hooks/useEventCalendar";
import { Calendar } from "@/components/ui/calendar";
import Events from "./Events";

const DashboardEvents = () => {
  const { activeDate, handleDateChange } = useEventCalendar();
  return (
    <div className="h-full overflow-hidden rounded-2xl bg-primary p-4">
      <p className="pb-3 font-semibold text-accent">Events Calendar</p>
      <div className="flex h-[calc(100%-2rem)] flex-col gap-4 lg:flex-row">
        <div className="flex-1 rounded-xl bg-white">
          <Calendar
            selected={activeDate}
            onSelect={handleDateChange}
            isMulti={false}
            mode="single"
          />
        </div>
        <div className="flex-1 overflow-auto">
          <Events />
        </div>
      </div>
    </div>
  );
};

export default DashboardEvents;
