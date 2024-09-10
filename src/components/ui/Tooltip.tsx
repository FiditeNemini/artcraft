import { cloneElement, ReactElement, JSXElementConstructor } from "react";
import { twMerge } from "tailwind-merge";

export const Tooltip = ({
  tip,
  children,
}: {
  tip: string;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}) => {
  const clonedChildren = cloneElement(children, {
    tooltip: tip,
    className: twMerge(
      "before:w-0 before:h-0 before:absolute",
      "before:left-1/2 before:bottom-full before:mb-[1px] before:-translate-x-1/2 before:z-50",
      "before:border-l-8 before:border-l-transparent",
      "before:border-r-8 before:border-r-transparent",
      "before:border-t-8 before:border-t-white",
      "after:absolute after:left-1/2 after:bottom-full after:-translate-x-1/2 after:z-40 ",
      "after:content-[attr(tooltip)] after:text-black after:text-nowrap",
      "after:rounded-xl after:border after:border-ui-border after:bg-ui-panel after:px-2 after:py-1 after:mb-2 after:shadow-xl",
      "after:hidden before:hidden hover:after:block hover:before:block",
      "relative",
      children.props.className,
    ),
  });
  return clonedChildren;
};
