import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-accent text-primary-text ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-50 dark:border-neutral-800 dark:text-neutral-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Add PropTypes for RadioGroup
RadioGroup.propTypes = {
  /** Additional class name for the root element */
  className: PropTypes.string,

  /** The controlled value of the radio item to check */
  value: PropTypes.string,

  /** The default value of the radio group */
  defaultValue: PropTypes.string,

  /** Event handler called when the value changes */
  onValueChange: PropTypes.func,

  /** Whether the radio group is disabled */
  disabled: PropTypes.bool,

  /** The reading direction of the radio group */
  dir: PropTypes.oneOf(["ltr", "rtl"]),

  /** The orientation of the component */
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),

  /** When `true`, keyboard navigation will loop from last item to first, and vice versa */
  loop: PropTypes.bool,

  /** Required name that will serve as the name for all radio items in this group */
  name: PropTypes.string,

  /** Whether focus should wrap */
  required: PropTypes.bool,

  /** Radio items */
  children: PropTypes.node,
};

// Add PropTypes for RadioGroupItem
RadioGroupItem.propTypes = {
  /** Additional class name for the radio item */
  className: PropTypes.string,

  /** The unique value of the radio item */
  value: PropTypes.string.isRequired,

  /** Whether the radio item is disabled */
  disabled: PropTypes.bool,

  /** Whether the radio item is required */
  required: PropTypes.bool,

  /** ID to use for form association */
  id: PropTypes.string,

  /** When `true`, prevents the user from interacting with the radio item */
  readOnly: PropTypes.bool,

  /** Children elements */
  children: PropTypes.node,
};

export { RadioGroup, RadioGroupItem };
