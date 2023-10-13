import React, { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import "./Button.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: IconDefinition;
  small?: boolean;
  variant?: "primary" | "secondary" | "danger";
  to?: string; // for internal links
  href?: string; // for external links
  target?: "_blank" | "_self";
}

export default function Button({
  label,
  icon,
  small,
  variant = "primary",
  to,
  href,
  target = "_self",
  ...rest
}: ButtonProps) {
  let buttonClass = `button`;

  if (small) {
    buttonClass += ` button-small`;
  }

  switch (variant) {
    case "primary":
      buttonClass += " button-primary";
      break;
    case "secondary":
      buttonClass += " button-secondary";
      break;
    case "danger":
      buttonClass += " button-destructive";
      break;
    default:
      buttonClass += " button-primary";
      break;
  }

  if (to) {
    return (
      <Link to={to} className={buttonClass}>
        {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
        {label}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel="noopener noreferrer"
        className={buttonClass}
      >
        {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
        {label}
      </a>
    );
  }

  // If neither 'to' nor 'href' are provided (regular button)
  return (
    <button className={buttonClass} type="button" {...rest}>
      {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
      {label}
    </button>
  );
}
