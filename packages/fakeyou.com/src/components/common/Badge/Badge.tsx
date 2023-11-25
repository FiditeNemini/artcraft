import React from "react";
import "./Badge.scss";

interface BadgeProps {
  label: string;
  color: string;
  shadow?: boolean;
}

export default function Badge({ label, color, shadow = false }: BadgeProps) {
  const badgeClass = `fy-badge badge-${color} ${shadow ? shadow : null} mb-0`;
  return <span className={badgeClass}>{label}</span>;
}
