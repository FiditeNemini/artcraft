import { ButtonHTMLAttributes, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";

export interface ToolbarButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const ToolbarButton = ({
  icon,
  onClick,
  buttonProps = {},
  iconProps,
}: {
  icon: IconDefinition;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  buttonProps?: ToolbarButtonProps;
  iconProps?: Omit<FontAwesomeIconProps, "icon">;
}) => {
  const {
    className: customButtonClassNames,
    disabled,
    active,
    onClick: customOnClick,
    ...restButtonProps
  } = buttonProps;
  const mergedButtonClasses = twMerge(
    "size-10 rounded-2xl p-2 hover:bg-secondary-500 hover:text-white",
    disabled && "pointer-events-none text-secondary-300",
    active && "pointer-events-none text-primary ",
    customButtonClassNames,
  );
  return (
    <button
      className={mergedButtonClasses}
      disabled={disabled}
      {...restButtonProps}
      onClick={onClick ? onClick : customOnClick}
    >
      <FontAwesomeIcon icon={icon} {...iconProps} />
    </button>
  );
};
