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
        className="h-10 rounded-md bg-brand-secondary p-3 text-white"
        style={{
          outline: "2px solid transparent",
          transition: "outline-color 0.15s ease-in-out",
        }}
        onFocus={(e) => (e.currentTarget.style.outlineColor = "#e66462")}
        onBlur={(e) => (e.currentTarget.style.outlineColor = "transparent")}
        {...rest}
      />
    </div>
  );
}
