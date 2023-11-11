import { ButtonHTMLAttributes } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export default interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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