import { ButtonHTMLAttributes, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";

import { Tooltip } from "~/components/ui";

export interface ToolbarButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const ToolbarButton = ({
  children,
  icon,
  tooltip,
  onClick,
  buttonProps = {},
  iconProps,
}: {
  children?: React.ReactNode;
  icon: IconDefinition;
  tooltip?: string;
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
    "rounded-2xl p-2 hover:bg-secondary-500 hover:text-white",
    children ? "w-fit flex items-center gap-2 text-nowrap" : "size-10",
    disabled && "pointer-events-none text-secondary-300",
    active && "pointer-events-none text-primary ",
    customButtonClassNames,
  );

  const Button = (
    <button
      className={mergedButtonClasses}
      disabled={disabled}
      {...restButtonProps}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) {
          onClick(e);
        } else if (customOnClick) {
          customOnClick(e);
        }
      }}
    >
      <FontAwesomeIcon icon={icon} {...iconProps} />
      {children}
    </button>
  );
  if (tooltip) {
    return <Tooltip tip={tooltip}>{Button}</Tooltip>;
  }
  return Button;
};
