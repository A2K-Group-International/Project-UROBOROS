import PropTypes from "prop-types"; // Import PropTypes
import { ChevronUp, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:
          " sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center  ",
        month: "space-y-4",
        caption: " pt-1 flex items-center gap-x-2 px-4  ",
        caption_label: "text-sm font-bold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 rounded-full hover:text-accent  hover:opacity-100"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1 ",
        head_row: "flex",
        head_cell:
          "text-xs rounded-md w-9 flex-1 font-bold dark:text-neutral-400 text-accent",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 mr-1 flex-1 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-neutral-800/50 dark:[&:has([aria-selected])]:bg-neutral-800",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-full aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-accent/70 text-white",
        day_today: "bg-accent text-white",
        day_outside:
          "day-outside text-neutral-500 aria-selected:bg-neutral-100/50 aria-selected:text-neutral-500 dark:text-neutral-400 dark:aria-selected:bg-neutral-800/50 dark:aria-selected:text-neutral-400",
        day_disabled: "text-neutral-500 opacity-50 dark:text-neutral-400",
        day_range_middle:
          "aria-selected:bg-neutral-100 aria-selected:text-neutral-900 dark:aria-selected:bg-neutral-800 dark:aria-selected:text-neutral-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronUp className="h-4 w-4" />,
        IconRight: () => <ChevronDown className="h-4 w-4" />,
      }}
      {...props}
    />
  );
};

// PropTypes validation
Calendar.propTypes = {
  className: PropTypes.string, // className should be a string
  classNames: PropTypes.object, // classNames should be an object (for custom classes)
  showOutsideDays: PropTypes.bool, // showOutsideDays should be a boolean
};

Calendar.displayName = "Calendar";

export { Calendar };
