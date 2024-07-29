import React from "react";
import "./Badge.scss";

interface BadgeProps {
  label: string;
  color?: string;
  overlay?: boolean;
  className?: string;
  small?: boolean;
}

export default function Badge({
  label,
  color = "gray", // should default to a visible state
  overlay = false,
  className = "",
  small = false,
}: BadgeProps) {
  const badgeClass = `fy-badge badge-${color} ${
    overlay ? "shadow" : ""
  } mb-0 ${className} ${small ? "badge-small" : ""}`.trim();

  return <span className={badgeClass}>{label}</span>;
}
