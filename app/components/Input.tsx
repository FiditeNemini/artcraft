import { twMerge } from "tailwind-merge";
import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Label } from "./Typography";
import { kebabCase } from "~/utilities";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: IconDefinition;
}

export function Input({ label, icon, className, id, ...rest }: InputProps) {
  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={id ? id : kebabCase(label)}>{label}</Label>}

      <div className="relative w-full">
        {icon && (
          <FontAwesomeIcon icon={icon} className="absolute h-5 pl-3 pt-2.5" />
        )}
        <input
          id={id ? id : label ? kebabCase(label) : undefined}
          className={twMerge(
            "h-10 w-full rounded-md bg-brand-secondary px-3 py-2.5 text-white outline-none outline-offset-0 transition-all duration-150 ease-in-out focus:outline-brand-primary",
            icon ? "pl-12" : "",
          )}
          {...rest}
        />
      </div>
    </div>
  );
}
