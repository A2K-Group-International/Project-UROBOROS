import { Loader2Icon } from "lucide-react";
import PropTypes from "prop-types";

import { cn } from "@/lib/utils";

const Spinner = ({ className, ...props }) => {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
};
Spinner.propTypes = {
  className: PropTypes.string,
};
export { Spinner };
