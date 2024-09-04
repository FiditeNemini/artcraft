import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/pro-thin-svg-icons";

export const ToolbarButtons = ({
  icon,
  onClick,
  buttonProps = { className: "" },
  iconProps,
}: {
  icon: IconDefinition;
  onClick?: () => void;
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  iconProps?: Omit<FontAwesomeIconProps, "icon">;
}) => {
  const { className: buttonClassName, ...restButtonProps } = buttonProps;
  const mergedButtonClasses = twMerge(
    "size-10 rounded-2xl p-2 hover:bg-secondary-500 hover:text-white",
    buttonClassName,
  );
  return (
    <button
      className={mergedButtonClasses}
      onClick={onClick}
      {...restButtonProps}
    >
      <FontAwesomeIcon icon={icon} {...iconProps} />
    </button>
  );
};
