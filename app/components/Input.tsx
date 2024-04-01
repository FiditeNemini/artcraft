import { twMerge } from "tailwind-merge";
import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Label } from "./Typography";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  icon?: IconDefinition
}

export function Input({label, icon, className, ...rest }: InputProps) {
  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      {label && <Label>{label}</Label>}

      <div className="relative w-full">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className="absolute pt-2.5 pl-3 h-5"
          />
        )}
        <input
          className={twMerge(
            "w-full h-10 rounded-md bg-brand-secondary p-3 text-white transition-all duration-150 ease-in-out outline-none outline-offset-0 focus:outline-brand-primary",
            icon? "pl-12" : "",
          )}
          {...rest}
        />
      </div>
    </div>
  );
}
