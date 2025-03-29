import * as React from "react";
import PropTypes from "prop-types";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "./separator";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

AlertDialogOverlay.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 block w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border border-neutral-200 bg-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dark:border-neutral-800 dark:bg-neutral-950 md:grid",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

AlertDialogContent.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col py-5 pl-8 pr-[26px] text-center sm:text-left",
      className
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

AlertDialogHeader.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogBody = ({ className, ...props }) => (
  <div>
    <Separator />
    <div className={cn("w-full p-6", className)} {...props} />
    <Separator />
  </div>
);
AlertDialogBody.displayName = "AlertDialogBody";

AlertDialogBody.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "mt-0 flex flex-col-reverse px-6 py-[18px] sm:flex-row sm:justify-end sm:space-x-[10px]",
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

AlertDialogFooter.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("pr-6 text-xl font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

AlertDialogTitle.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn(
        "text-[12px] font-medium text-accent/60 dark:text-neutral-400",
        className
      )}
      {...props}
    />
  )
);
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

AlertDialogDescription.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className, "flex-1 rounded-lg")}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

AlertDialogAction.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 flex-1 rounded-lg sm:mt-0",

      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

AlertDialogCancel.propTypes = {
  className: PropTypes.string,
  // Add other prop types as needed
};

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogBody,
};
