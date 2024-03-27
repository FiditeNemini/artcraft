import { TextareaHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge";

export const Textarea = ({
  className,
  ...rest
}:TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return(
    <textarea
      
      className={twMerge(
        "rounded-lg bg-ui-controls border border-ui-panel-border py-2 px-4"
        ,className
      )}
      style={{
        outline: "2px solid transparent",
        transition: "outline-color 0.15s ease-in-out",
      }}
      onFocus={(e) => (e.currentTarget.style.outlineColor = "#e66462")}
      onBlur={(e) => (e.currentTarget.style.outlineColor = "transparent")}
      {...rest}
    />
  );
}