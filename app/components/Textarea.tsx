import { TextareaHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge";

export const Textarea = ({
  className,
  ...rest
}:TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return(
    <textarea
      {...rest}
      className={twMerge(
        "rounded-lg bg-ui-controls border border-ui-panel-border py-2 px-4"
        ,className
      )}
    />
  );
}