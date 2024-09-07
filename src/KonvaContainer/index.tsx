import { forwardRef, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

import { useRenderCounter } from "~/hooks/useRenderCounter";

import { ContextualToolbarImage } from "./ContextualToolbarImage";
import { ContextualLoadingBar } from "./ContextualLoadingBar";
import { ToolbarMain, ErrorDialog } from "~/components/features";

export const KonvaContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  useRenderCounter("KonvaContainer");

  const classes = twMerge("pegboard -z-10", className);
  return (
    <>
      <div ref={ref} className={classes} {...props} />
      <ToolbarMain />
      <ContextualToolbarImage />
      <ContextualLoadingBar />
      <ErrorDialog />
    </>
  );
});
