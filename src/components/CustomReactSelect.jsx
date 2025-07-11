import PropTypes from "prop-types";
import ReactSelect, { components } from "react-select";

import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import React from "react";

const customStyles = {
  control: (styles) => ({
    ...styles,
    borderRadius: "15px",
    backgroundColor: "#F6F0ED",
    padding: "14px",
    boxShadow: "none",

    outline: "none",
    borderColor: "transparent",
    "&:hover": {
      borderColor: "transparent",
    },
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "#663F30",
  }),
  placeholder: (styles) => ({
    ...styles,
    color: "#663F30",
    fontSize: "14px",
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? "#663F30" : isFocused ? "#F6F0ED" : "white",
    color: isSelected ? "white" : "#663F30",
    cursor: isDisabled ? "not-allowed" : "default",
    padding: "10px 15px",
    ":active": {
      backgroundColor: "#663F30",
      color: "white",
    },
  }),
  menu: (styles) => ({
    ...styles,
    borderRadius: "16px",
    boxShadow: "0px 4px 12px rgba(102, 63, 48, 0.15)",
  }),

  multiValue: (styles) => ({
    ...styles,
    backgroundColor: "white",
    paddingTop: "6px",
    paddingBottom: "6px",
    boxShadow: "0px 4px 5.5px 0px rgba(102, 63, 48, 0.06)",
    paddingLeft: "10px",
    paddingRight: "10px",
    borderRadius: "5px",
  }),

  multiValueLabel: (styles) => ({
    ...styles,
    padding: "0px",
    color: "#663f30",
  }),

  multiValueRemove: (styles) => ({
    ...styles,
    color: "#663F30",
    transform: "scale(1.5)",
    backgroundColor: "white",
    ":hover": {
      backgroundColor: "white",
      color: "#663F30",
    },
  }),
};

// Custom MultiValue component to display avatars with initials
const CustomMultiValue = (props) => {
  const { data } = props;
  const initials = getInitial(data.label);

  return (
    <components.MultiValue {...props} className="flex items-center gap-2">
      <Avatar className="flex h-4 w-4 items-center justify-center">
        <AvatarImage src={data.image || ""} alt={data.label} />
        <AvatarFallback className="bg-accent text-center text-2xs text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <components.MultiValueLabel {...props} />
    </components.MultiValue>
  );
};

// Main Component
const CustomReactSelect = React.forwardRef(
  (
    {
      isMulti = true,
      styles = customStyles,
      options,
      value,
      onChange,
      placeholder,
      disabled,
      isLoading = false,
      className = "",
      defaultValue = null,
      hideSelectedOptions = true,
      ...rest
    },
    ref
  ) => {
    return (
      <ReactSelect
        ref={ref}
        defaultValue={defaultValue}
        isMulti={isMulti}
        isLoading={isLoading}
        styles={styles}
        components={{ MultiValue: CustomMultiValue }}
        options={options}
        value={value || undefined}
        onChange={onChange}
        placeholder={placeholder}
        isDisabled={disabled}
        className={className}
        hideSelectedOptions={hideSelectedOptions}
        {...rest}
      />
    );
  }
);

CustomReactSelect.propTypes = {
  isMulti: PropTypes.bool,
  styles: PropTypes.object,
  options: PropTypes.array.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  defaultValue: PropTypes.any,
  hideSelectedOptions: PropTypes.bool,
};

CustomMultiValue.propTypes = {
  data: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

CustomReactSelect.displayName = "CustomReactSelect";

export default CustomReactSelect;
