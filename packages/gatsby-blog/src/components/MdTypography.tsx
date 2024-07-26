import React, { DetailedHTMLProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type HeadingProps = DetailedHTMLProps<
  HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;

export const P = ({
  children,
  className,
  ...rest
}: DetailedHTMLProps<
  HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>) => (
  <p className={twMerge("text-[18px]", className)} {...rest}>
    {children}
  </p>
);

export const H1 = ({ children, className, ...rest }: HeadingProps) => (
  <h1
    className={twMerge("text-3xl font-bold md:text-5xl", className)}
    {...rest}
  >
    {children}
  </h1>
);

export const H2 = ({ children, className, ...rest }: HeadingProps) => (
  <h2
    className={twMerge("text-2xl font-bold md:text-4xl", className)}
    {...rest}
  >
    {children}
  </h2>
);

export const H3 = ({ children, className, ...rest }: HeadingProps) => (
  <h3 className={twMerge("text-xl font-bold md:text-3xl", className)} {...rest}>
    {children}
  </h3>
);

export const H4 = ({ children, className, ...rest }: HeadingProps) => (
  <h4 className={twMerge("text-lg font-bold", className)} {...rest}>
    {children}
  </h4>
);

export const H5 = ({ children, className, ...rest }: HeadingProps) => (
  <h5 className={twMerge("text-md font-bold", className)} {...rest}>
    {children}
  </h5>
);

export const H6 = ({ children, className, ...rest }: HeadingProps) => (
  <h6 className={twMerge("text-sm font-bold", className)} {...rest}>
    {children}
  </h6>
);
