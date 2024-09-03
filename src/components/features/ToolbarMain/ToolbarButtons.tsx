import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/pro-thin-svg-icons";

export const ToolbarButtons = ({
  icon,
  iconProps,
}: {
  icon: IconDefinition;
  iconProps?: Omit<FontAwesomeIconProps, "icon">;
}) => {
  return (
    <button className="size-10 rounded-2xl p-2 hover:bg-secondary-500 hover:text-white">
      <FontAwesomeIcon icon={icon} {...iconProps} />
    </button>
  );
};
