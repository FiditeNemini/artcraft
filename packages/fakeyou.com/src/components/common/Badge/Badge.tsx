import React from "react";

interface BadgeProps {
  label: string;
  color: string;
}

export default function Badge({ label, color }: BadgeProps) {
  const badgeClass = `fy-badge badge-${color} mb-0`;
  return <span className={badgeClass}>{label}</span>;
}
