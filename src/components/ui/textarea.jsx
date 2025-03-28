import * as React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-2xl border border-neutral-200 bg-primary px-3 py-2 text-base text-accent ring-offset-white placeholder:text-accent/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

// Adding PropTypes validation
Textarea.propTypes = {
  className: PropTypes.string,
};

export { Textarea };
