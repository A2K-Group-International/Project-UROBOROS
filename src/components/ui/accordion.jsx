import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "mb-2 rounded-lg border border-accent/20 text-accent",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";
AccordionItem.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const AccordionTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex px-2">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
AccordionTrigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const AccordionContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
      ref={ref}
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden border-t border-accent/20 pl-6 pt-2 text-sm transition-all"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
AccordionContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Accordion.propTypes = {
  type: PropTypes.oneOf(["single", "multiple"]),
  collapsible: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onValueChange: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
