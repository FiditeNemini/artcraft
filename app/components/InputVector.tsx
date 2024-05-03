import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import {
  disableHotkeyInput,
  enableHotkeyInput,
  DomLevels,
} from "~/pages/PageEnigma/store";

interface InputVectorProps {
  x: string;
  y: string;
  z: string;
  onBlur: () => void;
  onFocus: () => void;
  onChange: (v: { x: string; y: string; z: string }) => void;
  increment?: number;
}

export const InputVector = ({
  x,
  y,
  z,
  onBlur,
  onFocus,
  onChange,
  increment = 0.1,
}: InputVectorProps) => {
  const xRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const zRef = useRef<HTMLInputElement>(null);

  const inputCommonClasses =
    "relative h-6 rounded-r-lg bg-brand-secondary p-2 text-sm text-white transition-all duration-100 ease-in-out outline-none -outline-offset-2 text-end w-full hover:cursor-e-resize hover:bg-brand-secondary-900";

  const wrapperCommonClasses =
    "relative flex items-center before:inline-block before:h-6 before:bg-brand-primary before:text-white before:rounded-l-lg before:w-1.5 before:text-center before:justify-center before:items-center before:font-semibold before:flex before:align-middle before:leading-8 text-xs";

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      xRef.current !== null &&
      yRef.current !== null &&
      zRef.current !== null
    ) {
      const inputStr = e.target.value;

      const newVector: { [key: string]: string } = {
        x: xRef.current.value,
        y: yRef.current.value,
        z: zRef.current.value,
      };

      newVector[e.target.name] = inputStr;

      onChange(newVector);
    }
  }

  const blurAllInputs = () => {
    xRef.current?.blur();
    yRef.current?.blur();
    zRef.current?.blur();
  };

  // For dragging the input value to increment/decrement
  const handleMouseDown = (
    e: React.MouseEvent,
    ref: React.RefObject<HTMLInputElement>,
  ) => {
    e.preventDefault();
    blurAllInputs();
    let isDragging = false;
    let previousMousePosition = e.clientX;

    const mouseMoveHandler = (e: MouseEvent) => {
      isDragging = true;
      const currentMousePosition = e.clientX;
      const direction = currentMousePosition > previousMousePosition ? 1 : -1;
      previousMousePosition = currentMousePosition;

      const currentValue = Number(ref.current?.value) || 0;
      const newValue = currentValue + direction * increment;

      // onFocus();

      if (ref.current) {
        ref.current.value = newValue.toFixed(1);
        ref.current.blur();
      }

      onChange({
        x: xRef.current?.value || "",
        y: yRef.current?.value || "",
        z: zRef.current?.value || "",
      });
    };

    const mouseUpHandler = () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
      if (!isDragging) {
        // onBlur();
        ref.current?.focus();
        ref.current?.select();
      }
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.currentTarget as HTMLInputElement).blur(); // Unfocus the input field on pressing Enter
    }
  };

  return (
    <div className="flex w-full flex-col justify-between gap-1.5">
      <span className={twMerge(wrapperCommonClasses, "before:bg-axis-x")}>
        <div className="absolute left-3.5 z-10 font-semibold">X</div>
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-x")}
          type="text"
          name="x"
          onChange={handleOnChange}
          ref={xRef}
          value={x}
          onFocus={() => {
            disableHotkeyInput(DomLevels.INPUT);
            onFocus();
          }}
          onBlur={() => {
            enableHotkeyInput(DomLevels.INPUT);
            onBlur();
          }}
          onMouseDown={(e) => {
            onFocus();
            handleMouseDown(e, xRef);
          }}
          onMouseUp={() => onBlur()}
          onKeyDown={handleKeyDown}
        />
      </span>
      <span className={twMerge(wrapperCommonClasses, "before:bg-axis-y")}>
        <div className="absolute left-3.5 z-10 font-semibold">Y</div>
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-y")}
          type="text"
          name="y"
          onChange={handleOnChange}
          ref={yRef}
          value={y}
          onFocus={() => {
            disableHotkeyInput(DomLevels.INPUT);
            onFocus();
          }}
          onBlur={() => {
            enableHotkeyInput(DomLevels.INPUT);
            onBlur();
          }}
          onMouseDown={(e) => {
            onFocus();
            handleMouseDown(e, yRef);
          }}
          onMouseUp={() => onBlur()}
          onKeyDown={handleKeyDown}
        />
      </span>
      <span className={twMerge(wrapperCommonClasses, "before:bg-axis-z")}>
        <div className="absolute left-3.5 z-10 font-semibold">Z</div>
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-z")}
          type="text"
          name="z"
          onChange={handleOnChange}
          ref={zRef}
          value={z}
          onFocus={() => {
            disableHotkeyInput(DomLevels.INPUT);
            onFocus();
          }}
          onBlur={() => {
            enableHotkeyInput(DomLevels.INPUT);
            onBlur();
          }}
          onMouseDown={(e) => {
            onFocus();
            handleMouseDown(e, zRef);
          }}
          onMouseUp={() => onBlur()}
          onKeyDown={handleKeyDown}
        />
      </span>
    </div>
  );
};
