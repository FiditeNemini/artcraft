import React from "react";
import { twMerge } from "tailwind-merge";
import { IconDefinition } from "@fortawesome/pro-thin-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { kebabCase } from "~/utilities";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string;
  iconClassName?: string;
  label?: string;
  icon?: IconDefinition;
  isError?: boolean;
  errorMessage?: string;
}

export const Input = React.forwardRef(
  (
    {
      label,
      icon,
      inputClassName,
      iconClassName,
      className,
      id,
      isError,
      onBlur,
      onFocus,
      errorMessage,
      ...rest
    }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div className={twMerge("flex flex-col", className)}>
        {label && <label htmlFor={id ? id : kebabCase(label)}>{label}</label>}

        <div className="relative w-full">
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className={twMerge("text-md absolute pl-3 pt-3", iconClassName)}
            />
          )}
          <input
            ref={ref}
            id={id ? id : label ? kebabCase(label) : undefined}
            className={twMerge(
              "h-10 w-full rounded-lg bg-secondary px-3 py-2.5 outline-none",
              // on focus
              "outline-offset-0 transition-all duration-150 ease-in-out focus:outline-primary",
              icon && "pl-10",
              isError && "outline-red focus:outline-red",
              inputClassName,
            )}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              if (onFocus) {
                onFocus(e);
              }
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              if (onBlur) {
                onBlur(e);
              }
            }}
            {...rest}
          />
          {errorMessage && (
            <h6 className="text-red absolute z-10">{errorMessage}</h6>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
