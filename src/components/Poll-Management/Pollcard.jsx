import PropTypes from "prop-types";
import { format, isPast, parseISO } from "date-fns";
import { Icon } from "@iconify/react";
import { Label } from "../ui/label";

const Pollcard = ({
  title,
  description,
  expiryDate,
  response,
  onClick,
  isActive,
}) => {
  // Parse the ISO date string to a Date object
  const parsedExpiryDate = expiryDate ? parseISO(expiryDate) : null;

  // Format date to day and month
  const formattedDate = parsedExpiryDate
    ? format(parsedExpiryDate, "MMMM dd, yyyy")
    : null;

  // Format time to 12-hour format
  const formattedTime = parsedExpiryDate
    ? format(parsedExpiryDate, "h:mm a")
    : null;

  // Check if poll is expired - much simpler now!
  const isExpired = parsedExpiryDate ? isPast(parsedExpiryDate) : false;

  console.log(expiryDate);

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
