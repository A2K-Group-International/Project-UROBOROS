import PropTypes from "prop-types";
import { format, isPast, parse, set } from "date-fns";
import { Icon } from "@iconify/react";
import { Label } from "../ui/label";

const Pollcard = ({
  title,
  description,
  expiryDate,
  expiryTime,
  response,
  onClick,
  isActive,
}) => {
  // Format date to day name (Monday, Tuesday, etc.)
  const formattedDate = expiryDate ? format(expiryDate, "MMMM dd, yyyy") : null;

  // Format time to 12-hour format
  const formattedTime = expiryTime
    ? format(parse(expiryTime, "HH:mm", new Date()), "h:mm a")
    : null;

  // Check if poll is expired
  const isPollExpired = () => {
    if (!expiryDate || !expiryTime) return false;

    // Create a date object with both date and time components
    const [hours, minutes] = expiryTime.split(":").map(Number);
    const expiryDateTime = set(expiryDate, { hours, minutes });

    return isPast(expiryDateTime);
  };

  const isExpired = isPollExpired();

  return (
    <div
      className={`flex cursor-pointer gap-x-2 rounded-xl py-3 pl-3 pr-7 text-accent ${isActive ? "bg-primary" : "bg-primary/25"}`}
      onClick={onClick}
    >
      <div className="mt-1">
        <Icon icon="mingcute:align-left-2-fill" width={20} height={20} />
      </div>
      <div className="flex-1">
        <Label className="text-md font-bold">{title}</Label>
        <p className="text-[12px] text-accent/70">
          {description || "No description provided."}
        </p>
        {formattedDate && formattedTime && (
          <div className="flex items-center text-xs text-accent/70">
            <Icon
              icon={
                isExpired ? "mingcute:close-circle-fill" : "mingcute:time-line"
              }
              className="mr-1"
              width={14}
              color={isExpired ? "#E55C5C" : undefined}
            />
            <span
              className={`font-semibold ${isExpired ? "text-red-500" : "text-accent/70"}`}
            >
              {isExpired
                ? "Closed"
                : `Open until ${formattedDate}, ${formattedTime}`}
            </span>
          </div>
        )}
        <p className="text-[12px] text-accent/70">
          <span className="font-bold">Response Received: </span>
          {response || 0}
        </p>
        {/* <ResponseBar /> */}
      </div>
    </div>
  );
};

Pollcard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  response: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  expiryDate: PropTypes.instanceOf(Date),
  expiryTime: PropTypes.string,
};

// const ResponseBar = () => {
//   return (
//     <div className="mt-3 flex h-2 w-full overflow-hidden rounded bg-white">
//       <div className="bg-[#5BD071]" style={{ width: "50%" }}></div>
//       <div className="bg-[#3AABB8]" style={{ width: "30%" }}></div>
//       <div className="bg-[#E24841]" style={{ width: "20%" }}></div>
//     </div>
//   );
// };

export default Pollcard;
