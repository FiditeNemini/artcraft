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
  variant?: "primary" | "secondary" | "danger" | "link";
  to?: string;
  href?: string;
  target?: "_blank" | "_self";
  square?: boolean;
  tooltip?: string;
  full?: boolean;
  iconFlip?: boolean;
  download?: boolean | string;
  disabled?: boolean;
  isLoading?: boolean;
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
  iconFlip = false,
  download,
  disabled,
  isLoading = false,
  ...rest
}: ButtonProps) {
  let iconMarginClass = !square && label ? (iconFlip ? "ms-2" : "me-2") : "";
  let IconComponent = icon ? (
    <FontAwesomeIcon icon={icon} className={iconMarginClass} />
  ) : null;

  let LabelComponent = !square ? label : null;

  const SpinnerComponent = isLoading ? (
    <div
      className="spinner-border spinner-border-sm text-white ms-2"
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  ) : null;

  const externalClass = rest.className || "";

  const commonProps = {
    className: `${externalClass} button ${small ? "button-small" : ""} ${
      square ? (small ? "button-square-small" : "button-square") : ""
    } button-${variant} ${full ? "w-100" : ""}`,
    disabled: disabled || isLoading,
  };

  delete rest.className;

  const ButtonContent = iconFlip ? (
    <>
      {LabelComponent}
      {IconComponent}
      {SpinnerComponent}
    </>
  ) : (
    <>
      {IconComponent}
      {LabelComponent}
      {SpinnerComponent}
    </>
  );

  const WrappedButton = to ? (
    <Link to={to} {...commonProps}>
      {ButtonContent}
    </Link>
  ) : href ? (
    <a
      href={href}
      target={target}
      rel="noopener noreferrer"
      download={
        download ? (typeof download === "string" ? download : true) : undefined
      }
      {...commonProps}
    >
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
