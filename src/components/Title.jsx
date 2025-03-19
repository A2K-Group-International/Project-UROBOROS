import { forwardRef } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const Title = forwardRef(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn("text-[18px] font-bold leading-none text-accent", className)}
    {...props}
  />
));

Title.displayName = "Title";

Title.propTypes = {
  className: PropTypes.string,
};

const Description = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium leading-none text-accent/60", className)}
    {...props}
  />
));

Description.displayName = "Description";

Description.propTypes = {
  className: PropTypes.string,
};

export { Title, Description };
