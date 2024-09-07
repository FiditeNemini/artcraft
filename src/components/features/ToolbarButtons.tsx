import { ButtonHTMLAttributes, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";

export const ToolbarButtons = ({
  icon,
  onClick,
  buttonProps = { className: "" },
  iconProps,
}: {
  icon: IconDefinition;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  iconProps?: Omit<FontAwesomeIconProps, "icon">;
}) => {
  const {
    className: customButtonClassNames,
    disabled,
    ...restButtonProps
  } = buttonProps;
  const mergedButtonClasses = twMerge(
    "size-10 rounded-2xl p-2 hover:bg-secondary-500 hover:text-white",
    disabled && "pointer-events-none text-secondary-300",
    customButtonClassNames,
  );
  return (
    <button
      className={mergedButtonClasses}
      onClick={onClick}
      disabled={disabled}
      {...restButtonProps}
    >
      <FontAwesomeIcon icon={icon} {...iconProps} />
    </button>
  );
};
