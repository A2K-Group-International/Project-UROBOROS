import { useContext } from "react";
import { DashboardCalendarContext } from "@/context/DashCalendarContext";

const useEventCalendar = () => {
  const { activeDate, setActiveDate } = useContext(DashboardCalendarContext);

  if (!activeDate || !setActiveDate) {
    throw new Error(
      "useEventCalendar must be used within a DashboardCalendarContextProvider"
    );
  }

  const handleDateChange = (date) => {
    setActiveDate(date);
  };

  return {
    activeDate,
    handleDateChange,
  };
};

export default useEventCalendar;
