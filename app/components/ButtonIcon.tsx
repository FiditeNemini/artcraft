import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

interface ButtonIconProps {
  icon: IconDefinition;
  onClick: () => void;
  className?: string;
  fill?: boolean;
}

export const ButtonIcon = ({
  icon,
  onClick,
  className : propsClassName,
  fill = false,
}: ButtonIconProps) => {
  const className = twMerge(
    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
    fill
      ? "bg-ui-controls-button hover:bg-ui-controls-button/[0.75]"
      : "bg-transparent hover:bg-ui-panel/[0.4]",
    propsClassName,
  );

  return (
    <button className={className} onClick={onClick}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};
