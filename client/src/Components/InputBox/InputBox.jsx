import React from "react";

export default function InputBox({
  label,
  name,
  type,
  placeholder,
  value,
  onChange = () => {},
  disabled = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={name}
        className={`font-[500] text-xl text-[#3A5A7A]-600 dark:text-white font-lato`}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={`bg-white text-black text-lg font-inter px-3 py-2 border border-gray-300 rounded-lg focus:border-[#4D6D8E] focus:ring-2 focus:ring-[#3A5A7A]-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-[#4D6D8E] dark:focus:ring-[#3A5A7A]-800 transition-colors duration-200`}
        onChange={onChange}
        value={value || ""}
        disabled={disabled}
      />
    </div>
  );
}
