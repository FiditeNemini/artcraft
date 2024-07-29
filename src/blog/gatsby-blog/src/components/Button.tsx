import { Link } from "gatsby";
import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  onClick?: () => void;
  to?: string;
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}

const Button = ({
  onClick,
  to,
  children,
  className,
  variant = "primary",
}: ButtonProps) => {
  const baseClasses =
    "flex w-fit px-4 py-2 rounded-lg font-semibold text-white hover:bg-primary-400 transition-colors duration-200";
  const variantClasses = variant === "primary" ? "bg-primary" : "bg-secondary";
  const btnClasses = twMerge(baseClasses, variantClasses, className);

  return (
    <>
      {onClick ? (
        <button onClick={onClick} className={btnClasses}>
          {children}
        </button>
      ) : (
        <Link to={to || "/"} className={btnClasses}>
          {children}
        </Link>
      )}
    </>
  );
};

export default Button;
