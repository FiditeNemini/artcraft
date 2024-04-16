import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { disableHotkeyInput,enableHotkeyInput,DomLevels } from "~/pages/PageEnigma/store";

interface InputVectorProps {
  x: number;
  y: number;
  z: number;
  onChange: (v: { x: number; y: number; z: number }) => void;
}

export const InputVector = ({ x, y, z, onChange }: InputVectorProps) => {
  const xRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const zRef = useRef<HTMLInputElement>(null);

  const inputCommonClasses =
    "relative w-14 h-7 rounded-r-lg bg-brand-secondary p-3 text-sm text-white transition-all duration-150 ease-in-out outline-none -outline-offset-2";

  const wrapperCommonClasses =
    "flex items-center before:inline-block before:w-10 before:h-10 before:bg-brand-primary before:text-white before:rounded-l-lg before:h-7 before:w-5 before:text-center before:justify-center before:items-center before:font-semibold before:flex before:align-middle before:leading-8 text-xs";

  function handleOnChange() {
    const newVector = {
      x: Number(xRef.current?.value),
      y: Number(yRef.current?.value),
      z: Number(zRef.current?.value),
    };
    onChange(newVector);
  }
  return (
    <div className="flex w-full justify-between gap-2">
      <span
        className={twMerge(
          wrapperCommonClasses,
          "before:bg-axis-x before:content-['X']",
        )}
      >
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-x")}
          type="number"
          onChange={handleOnChange}
          ref={xRef}
          value={x}
          onFocus={() => disableHotkeyInput(DomLevels.INPUT)}
          onBlur={() => enableHotkeyInput(DomLevels.INPUT)}
        />
      </span>
      <span
        className={twMerge(
          wrapperCommonClasses,
          "before:bg-axis-y before:content-['Y']",
        )}
      >
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-y")}
          type="number"
          onChange={handleOnChange}
          ref={yRef}
          value={y}
          onFocus={() => disableHotkeyInput(DomLevels.INPUT)}
          onBlur={() => enableHotkeyInput(DomLevels.INPUT)}
        />
      </span>
      <span
        className={twMerge(
          wrapperCommonClasses,
          "before:bg-axis-z before:content-['Z']",
        )}
      >
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-z")}
          type="number"
          onChange={handleOnChange}
          ref={zRef}
          value={z}
          onFocus={() => disableHotkeyInput(DomLevels.INPUT)}
          onBlur={() => enableHotkeyInput(DomLevels.INPUT)}
        />
      </span>
    </div>
  );
};
