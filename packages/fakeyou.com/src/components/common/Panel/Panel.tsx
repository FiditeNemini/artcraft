import React from "react";

interface PanelProps {
  children: React.ReactNode;
  padding?: boolean;
  mb?: boolean;
  mt?: boolean;
  className?: string;
}

export default function Panel({
  children,
  padding,
  mb,
  mt,
  className,
}: PanelProps) {
  return (
    <div
      className={`panel ${padding ? "p-3 py-4 p-md-4" : ""}
        ${mb ? "mb-4" : ""} ${mt ? "mt-4" : ""} overflow-hidden ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}
