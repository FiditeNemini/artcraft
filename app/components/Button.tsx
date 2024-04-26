import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

export interface ButtonPropsI
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconDefinition;
  iconFlip?: boolean;
  htmlFor?: string;
  variant?: "primary" | "secondary" | "action";
}

export const Button = ({
  icon,
  children,
  className: propsClassName,
  htmlFor,
  variant: propsVariant = "primary",
  disabled,
  iconFlip = false,
  ...rest
}: ButtonPropsI) => {
  const ButtonType = htmlFor ? "label" : "button";

  function getVariantClassNames(variant: string) {
    switch (variant) {
      case "secondary": {
        return "bg-brand-secondary hover:bg-brand-secondary-900 text-white focus-visible:outline-brand-secondary";
      }
      case "action": {
        return " bg-action hover:bg-action-500 text-white focus-visible:outline-action";
      }
      case "primary":
      default: {
        return "bg-brand-primary hover:bg-brand-primary-400 text-white focus-visible:outline-brand-primary-600";
      }
    }
  }

  const disabledClass = twMerge(
    disabled ? "opacity-40 pointer-events-none" : "",
  );

  const className = twMerge(
    "text-sm font-medium rounded-lg px-3 py-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-150 flex gap-2 items-center justify-center",
    getVariantClassNames(propsVariant),
    propsClassName,
    disabledClass,
  );

  return (
    <ButtonType
      className={className}
      disabled={disabled}
      {...{ ...rest, htmlFor }}>
      {icon && !iconFlip ? <FontAwesomeIcon icon={icon} /> : null}
      <div>{children}</div>
      {icon && iconFlip ? <FontAwesomeIcon icon={icon} /> : null}
    </ButtonType>
  );
};
