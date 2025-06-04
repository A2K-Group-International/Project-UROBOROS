import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { Label } from "../ui/label";

const Pollcard = ({ title, description, response }) => {
  return (
    <div className="flex cursor-pointer gap-x-2 rounded-xl bg-primary py-3 pl-3 pr-7 text-accent">
      <div className="mt-1">
        <Icon icon="mingcute:align-left-2-fill" width={20} height={20} />
      </div>
      <div className="flex-1">
        <Label className="text-md font-bold">{title}</Label>
        <p className="text-[12px] text-accent/70">
          {description || "No description provided."}
        </p>
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
