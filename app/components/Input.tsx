import React from "react";
import { Label } from "./Typography";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export function Input({ label, className, ...rest }: InputProps) {
  return (
    <div className={"flex flex-col " + className}>
      {label && <Label>{label}</Label>}

      <input
        className="h-10 rounded-md bg-brand-secondary p-3 text-white outline-none outline-offset-0 transition-all duration-150 ease-in-out focus:outline-brand-primary"
        {...rest}
      />
    </div>
  );
}
