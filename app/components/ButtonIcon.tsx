import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";

export interface ButtonIconPropsI
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition;
  iconClass?: string;
  iconProps?: FontAwesomeIconProps;
}

export const ButtonIcon = ({
  icon,
  iconClass,
  iconProps,
  className: propsClassName,
  ...rest
}: ButtonIconPropsI) => {
  return (
    <button className={propsClassName} {...rest}>
      {icon && (
        <FontAwesomeIcon {...iconProps} className={iconClass} icon={icon} />
      )}
    </button>
  );
};
