import { twMerge } from "tailwind-merge";
import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Label } from "./Typography";
import { kebabCase } from "~/utilities";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: IconDefinition
}

export function Input({
  label, icon, className, id, ...rest
}: InputProps) {
  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      {label && 
        <Label htmlFor={id ? id : kebabCase(label)}>
          {label}
        </Label>
      }

      <div className="relative w-full">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className="absolute pt-2.5 pl-3 h-5"
          />
        )}
        <input
          id={id ? id : (label ? kebabCase(label) : undefined)}
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
