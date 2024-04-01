import { NavLink, NavLinkProps } from "@remix-run/react";
import { twMerge } from "tailwind-merge";

interface TypogProps  {
  className?: string;
  children: React.ReactNode;
}
const baseTypo = "text-white";

export const H1 = ({className,children,}:TypogProps)=>
  <h1 className={twMerge(baseTypo, "font-medium text-2xl",className)}>{children}</h1>;

export const H2 = ({className,children,}:TypogProps)=>
  <h2 className={twMerge(baseTypo, "font-medium text-xl", className)}> {children} </h2>;

export const H3 = ({className,children,}:TypogProps)=>
  <h3 className={twMerge(baseTypo, "font-medium text-lg", className)}> {children} </h3>;

export const H4 = ({className,children,}:TypogProps)=>
  <h4 className={twMerge(baseTypo, "font-medium text-base", className)}> {children} </h4>;

  export const Label = ({className,children,}:TypogProps)=>
  <label className={twMerge(baseTypo, "font-medium text-base", className)}> {children} </label>;

export const H5 = ({className,children,}:TypogProps)=>
  <h5 className={twMerge(baseTypo, "font-medium text-sm",className)}> {children} </h5>;

export const H6 = ({className,children,}:TypogProps)=>
  <h6 className={twMerge(baseTypo, "font-light text-sm",className)}> {children} </h6>;

export const Link = ({className, ...rest}:NavLinkProps)=>
  <NavLink
    className={twMerge(
      "text-brand-primary hover:text-brand-primary-400",
      className as string,
    )}
    {...rest}
  />

export const P = ({className,children,}:TypogProps)=>
  <p className={twMerge(baseTypo, className)}> {children} </p>;