import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";
// import { Icon } from "@iconify/react";

const TimePicker = ({ value, onChange, disabled, className = "" }) => {
  return (
    <div className="relative mt-0">
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15} // 15-minute intervals
        timeCaption="Time"
        dateFormat="h:mm aa"
        className={`rounded-full border border-neutral-200 bg-primary px-4 py-2 text-sm text-accent/75 placeholder:text-accent/50 ${className} `}
        popperPlacement="bottom-start"
        placeholderText="Set time"
        disabled={disabled}
      />
      {/* <div className="absolute right-16 top-1/2 -translate-y-1/2 transform">
        <Icon icon="mingcute:time-line" width={20} className="text-accent" />
      </div> */}
    </div>
  );
};

// Prop validation
TimePicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]), // value should be a Date object
  onChange: PropTypes.func.isRequired, // onChange should be a function
  className: PropTypes.string, // className is optional and should be a string
  disabled: PropTypes.bool, // disabled is optional and should be a boolean
};

export default TimePicker;
