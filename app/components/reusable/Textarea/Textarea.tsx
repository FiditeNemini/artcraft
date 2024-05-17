import { TextareaHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { Label } from "~/components";
import { kebabCase } from "~/utilities";
import {
  disableHotkeyInput,
  enableHotkeyInput,
  DomLevels,
} from "~/pages/PageEnigma/signals";

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
  id,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  resize?: ResizeType;
}) => {
  return (
    <div className="flex flex-col">
      {label && <Label htmlFor={id ? id : kebabCase(label)}>{label}</Label>}

      <textarea
        id={id ? id : label ? kebabCase(label) : undefined}
        className={twMerge(
          "rounded-lg border border-ui-panel-border bg-ui-controls px-3 py-2",
          className,
        )}
        style={{
          outline: "2px solid transparent",
          transition: "outline-color 0.15s ease-in-out",
          resize: resize,
        }}
        onFocus={(e) => {
          disableHotkeyInput(DomLevels.INPUT);
          e.currentTarget.style.outlineColor = "#e66462";
        }}
        onBlur={(e) => {
          enableHotkeyInput(DomLevels.INPUT);
          e.currentTarget.style.outlineColor = "transparent";
        }}
        onKeyDown={(event) => event.stopPropagation()}
        {...rest}
      />
    </div>
  );
};
