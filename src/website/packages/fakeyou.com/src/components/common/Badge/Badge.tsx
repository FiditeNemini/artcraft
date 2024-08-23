import React from "react";
import "./Badge.scss";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface BadgeProps {
  label: string;
  color?: string;
  overlay?: boolean;
  className?: string;
  small?: boolean;
  icon?: IconDefinition;
}

export default function Badge({
  label,
  color = "gray",
  overlay = false,
  className = "",
  small = false,
  icon,
}: BadgeProps) {
  const badgeClass = `fy-badge badge-${color} ${
    overlay ? "shadow" : ""
  } mb-0 ${className} ${small ? "badge-small" : ""}`.trim();

  return (
    <span className={badgeClass}>
      {icon && <FontAwesomeIcon icon={icon} className="me-1" />}
      {label}
    </span>
  );
}
