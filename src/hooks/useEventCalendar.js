import { useContext } from "react";
import { DashboardCalendarContext } from "@/context/DashCalendarContext";

const useEventCalendar = () => {
  const { activeDate, setActiveDate } = useContext(DashboardCalendarContext);

  const handleDateChange = (date) => {
    setActiveDate(date);
  };

  return {
    activeDate,
    handleDateChange,
  };
};

export default useEventCalendar;
