import * as React from "react";
import PropTypes from "prop-types";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-3xl border border-neutral-200 bg-primary px-3 py-2 font-montserrat text-base text-accent ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-accent/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
};

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const disabled =
    props.value === "" || props.value === undefined || props.disabled;

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("hide-password-toggle pr-10", className)}
        ref={ref}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
      >
        {showPassword && !disabled ? (
          <EyeIcon className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </Button>

      {/* hides browsers password toggles */}
      <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

PasswordInput.propTypes = {
  className: PropTypes.string,
  props: PropTypes.object,
  value: PropTypes.string,
  disabled: PropTypes.bool,
};

export { Input, PasswordInput };
