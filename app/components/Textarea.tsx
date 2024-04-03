import { TextareaHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { Label } from "./Typography";

type ResizeType =
  | "none"
  | "both"
  | "horizontal"
  | "vertical"
  | "block"
  | "inline"
  | undefined;

export const Textarea = ({
  className,
  label,
  resize = "vertical",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  resize?: ResizeType;
}) => {
  return (
    <div className="flex flex-col">
      {label && <Label>{label}</Label>}
      <textarea
        className={twMerge(
          "rounded-lg border border-ui-panel-border bg-ui-controls p-3",
          className,
        )}
        style={{
          outline: "2px solid transparent",
          transition: "outline-color 0.15s ease-in-out",
          resize: resize,
        }}
        onFocus={(e) => (e.currentTarget.style.outlineColor = "#e66462")}
        onBlur={(e) => (e.currentTarget.style.outlineColor = "transparent")}
        {...rest}
      />
    </div>
  );
};
