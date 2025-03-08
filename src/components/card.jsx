import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 shadow-lg rounded-xl ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div className="p-2">{children}</div>;
};
