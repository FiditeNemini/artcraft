import React from "react";
import "./Badge.scss";

interface BadgeProps {
  label: string;
  color: string;
  overlay?: boolean;
  className?: string;
}

export default function Badge({
  label,
  color,
  overlay = false,
  className = "",
}: BadgeProps) {
  const badgeClass = `fy-badge badge-${color} ${
    overlay ? "shadow" : ""
  } mb-0 ${className}`.trim();

  return <span className={badgeClass}>{label}</span>;
}
