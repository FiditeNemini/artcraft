import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  type?: "full" | "padded" | "panel";
  className?: string;
}

export default function PageContainer({
  children,
  type = "full",
  className = "",
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
      containerClass = "container-panel";
      break;
    default:
      containerClass = "container-fluid";
      break;
  }

  // Merge the classNames
  const mergedClassNames = `${containerClass} ${className}`;

  return <div className={mergedClassNames}>{children}</div>;
}
