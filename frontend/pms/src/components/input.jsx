// @/components/ui/input.jsx

import React, { forwardRef } from "react";

export const Input = forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`
        w-full
        rounded-md
        border
        border-gray-300
        bg-white
        px-3
        py-2
        text-sm
        text-gray-900
        placeholder-gray-400
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        dark:border-gray-700
        dark:bg-gray-800
        dark:text-white
        dark:placeholder-gray-500
        ${className}
      `}
      {...props}
    />
  );
});

Input.displayName = "Input";
