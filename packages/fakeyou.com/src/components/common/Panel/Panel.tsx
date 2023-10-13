import React from "react";

interface PanelProps {
  children: React.ReactNode;
  padding?: boolean;
  mb?: boolean;
  mt?: boolean;
  full?: boolean;
}

export default function Panel({ children, padding, mb, mt, full }: PanelProps) {
  return (
    <div className={full ? "container-panel mw-100" : "container-panel"}>
      <div
        className={`panel ${padding ? "p-3 py-4 p-md-4" : ""}
        ${mb ? "mb-4" : ""} ${mt ? "mt-4" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
