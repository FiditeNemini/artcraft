import React, { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import "./Button.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string | null;
  icon?: IconDefinition;
  small?: boolean;
  variant?: "primary" | "secondary" | "danger";
  to?: string;
  href?: string;
  target?: "_blank" | "_self";
  square?: boolean;
  tooltip?: string;
  full?: boolean;
}

export default function Button({
  label,
  icon,
  small,
  variant = "primary",
  to,
  href,
  target = "_self",
  square,
  tooltip,
  full = false,
  ...rest
}: ButtonProps) {
  let IconComponent = icon ? (
    <FontAwesomeIcon icon={icon} className={!square && label ? "me-2" : ""} />
  ) : null;
  let LabelComponent = !square ? label : null;

  const externalClass = rest.className || "";

  const commonProps = {
    className: `${externalClass} button ${small ? "button-small" : ""} ${
      square ? (small ? "button-square-small" : "button-square") : ""
    } button-${variant} ${full ? "w-100" : ""}`,
  };

  delete rest.className;

  const ButtonContent = (
    <>
      {IconComponent}
      {LabelComponent}
    </>
  );

  const WrappedButton = to ? (
    <Link to={to} {...commonProps}>
      {ButtonContent}
    </Link>
  ) : href ? (
    <a href={href} target={target} rel="noopener noreferrer" {...commonProps}>
      {ButtonContent}
    </a>
  ) : (
    <button type="button" {...commonProps} {...rest}>
      {ButtonContent}
    </button>
  );

  return tooltip ? (
    <Tippy theme="fakeyou" content={tooltip}>
      {WrappedButton}
    </Tippy>
  ) : (
    WrappedButton
  );
}
