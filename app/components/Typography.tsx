import { twMerge } from "tailwind-merge";

interface TypogProps {
  className?: string;
  children: React.ReactNode;
}
const baseTypo = "text-white";

export const H1 = ({ className, children }: TypogProps) => (
  <h1 className={twMerge(baseTypo, "text-2xl font-medium", className)}>
    {children}
  </h1>
);

export const H2 = ({ className, children }: TypogProps) => (
  <h2 className={twMerge(baseTypo, "text-xl font-medium", className)}>
    {" "}
    {children}{" "}
  </h2>
);

export const H3 = ({ className, children }: TypogProps) => (
  <h3 className={twMerge(baseTypo, "text-lg font-medium", className)}>
    {" "}
    {children}{" "}
  </h3>
);

export const H4 = ({ className, children }: TypogProps) => (
  <h4 className={twMerge(baseTypo, "text-base font-medium", className)}>
    {" "}
    {children}{" "}
  </h4>
);

export const Label = ({ className, children }: TypogProps) => (
  <label className={twMerge(baseTypo, "mb-2 text-base font-medium", className)}>
    {" "}
    {children}{" "}
  </label>
);

export const H5 = ({ className, children }: TypogProps) => (
  <h5 className={twMerge(baseTypo, "text-sm font-medium", className)}>
    {" "}
    {children}{" "}
  </h5>
);

export const H6 = ({ className, children }: TypogProps) => (
  <h6 className={twMerge(baseTypo, "text-sm font-light", className)}>
    {" "}
    {children}{" "}
  </h6>
);

export const P = ({ className, children }: TypogProps) => (
  <p className={twMerge(baseTypo, className)}> {children} </p>
);
