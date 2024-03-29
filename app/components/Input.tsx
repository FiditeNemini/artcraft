import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export function Input({ label, className, ...rest }: InputProps) {
  return (
    <div className={"flex flex-col " + className}>
      {label && (
        <label className="text-md mb-2 font-medium text-white">{label}</label>
      )}

      <input
        className="h-10 rounded-md bg-brand-secondary p-3 text-white transition-all duration-150 ease-in-out outline-none outline-offset-0 focus:outline-brand-primary"
        {...rest}
      />
    </div>
  );
}
