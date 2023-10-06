import React, { ButtonHTMLAttributes } from "react";
import "./Button.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: IconDefinition;
  small?: boolean;
  secondary?: boolean;
  danger?: boolean;
}

export default function Button({
  label,
  icon,
  small,
  secondary,
  danger,
  ...rest
}: ButtonProps) {
  const buttonClasses = `button ${small ? "button-small" : ""}
  ${
    secondary
      ? "button-secondary"
      : danger
      ? "button-destructive"
      : "button-primary"
  } `;

  return (
    <button className={buttonClasses} type="button" {...rest}>
      {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
      {label}
    </button>
  );
}
