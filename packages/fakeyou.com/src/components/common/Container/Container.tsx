import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  type?: "full" | "padded" | "panel";
}

export default function PageContainer({
  children,
  type = "panel",
}: ContainerProps) {
  let containerClass = "";

  switch (type) {
    case "full":
      containerClass = "container-fluid";
      break;
    case "padded":
      containerClass = "container";
      break;
    case "panel":
      containerClass = "";
      break;
    default:
      containerClass = "container-fluid";
      break;
  }

  return <div className={containerClass}>{children}</div>;
}
