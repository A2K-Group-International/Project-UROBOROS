import PropTypes from "prop-types";
import { createContext, useState } from "react";

export const DashboardCalendarContext = createContext({});

const DashboardCalendarContextProvider = ({ children }) => {
  const [activeDate, setActiveDate] = useState(new Date());

  return (
    <DashboardCalendarContext.Provider
      value={{
        activeDate,
        setActiveDate,
      }}
    >
      {children}
    </DashboardCalendarContext.Provider>
  );
};

DashboardCalendarContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardCalendarContextProvider;
