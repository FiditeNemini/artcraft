import { forwardRef, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export const KonaContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const classes = twMerge("pegboard -z-10", className);
  return <div ref={ref} className={classes} {...props} />;
});
