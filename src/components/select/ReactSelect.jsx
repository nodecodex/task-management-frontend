import React from "react";
import Select, { components } from "react-select";
import { FaAngleDown } from "react-icons/fa";

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <FaAngleDown />
    </components.DropdownIndicator>
  );
};

const RSelect = ({ ...props }) => {
  return (
    <div className="r-select-wrapper">
      <style>
        {`
          .r-select-wrapper .react-select__indicators {
            display: flex !important;
          }
          .r-select-wrapper .react-select__indicator-separator {
            display: none !important;
          }
        `}
      </style>
      <Select
        className={`react-select-container ${props.className ? props.className : ""}`}
        classNamePrefix="react-select"
        components={{ DropdownIndicator, ...props.components }}
        {...props}
      />
    </div>
  );
};

export default RSelect;
