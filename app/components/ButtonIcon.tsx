import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ButtonIconProps extends FontAwesomeIconProps {
  icon: IconDefinition;
  onClick: () => void;
  className?: string;
  hoverFill?: boolean;
  disabled?: boolean;
}

export const ButtonIcon = ({
  icon,
  size,
  onClick,
  className: propsClassName,
  hoverFill = false,
  disabled,
  ...rest
}: ButtonIconProps) => {
  const className = twMerge(
    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
    hoverFill
      ? "bg-ui-controls-button hover:bg-ui-controls-button/[0.75]"
      : "bg-transparent hover:bg-ui-panel/[0.4]",
    propsClassName,
  );

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <FontAwesomeIcon icon={icon} size={size} {...rest}/>
    </button>
  );
};
