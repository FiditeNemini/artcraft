import { useRef } from "react";
import { twMerge } from "tailwind-merge";


interface InputVectorProps {
  x: number;
  y: number;
  z: number;
  onChange : (v:{
    x:number;
    y:number;
    z:number;
  })=>void;
}

export const InputVector = ({
  x,y,z,
  onChange
}:InputVectorProps)=>{
  const xRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const zRef = useRef<HTMLInputElement>(null);

  const inputCommonClasses ="relative w-14 h-8 rounded-r-md bg-brand-secondary p-3 text-base text-white transition-all duration-150 ease-in-out outline-none -outline-offset-2 ";

  const wrapperCommonClasses = "flex items-center before:inline-block before:w-10 before:h-10 before:bg-brand-primary before:text-white before:rounded-l-md before:h-8 before:w-4 before:text-center before:align-middle before:leading-8 text-xs";

  function handleOnChange(){
    const newVector = {
      x: Number(xRef.current?.value),
      y: Number(yRef.current?.value),
      z: Number(zRef.current?.value),
    }
    onChange(newVector);
  }
  return(
    <div className="w-full flex justify-between gap-2">
      <span className={twMerge(wrapperCommonClasses, "before:bg-axis-x before:content-['X']")}>
        <input 
          className={twMerge(inputCommonClasses, "focus:outline-axis-x")}
          onChange={handleOnChange}
          ref={xRef}
          value={x}
          
        />
      </span>
      <span className={twMerge(wrapperCommonClasses, "before:bg-axis-y before:content-['Y']")}>
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-y")}
          onChange={handleOnChange}
          ref={yRef}
          value={y}
        />
      </span>
      <span className={twMerge(wrapperCommonClasses, "before:bg-axis-z before:content-['Z']")}>
        <input
          className={twMerge(inputCommonClasses, "focus:outline-axis-z")}
          onChange={handleOnChange}
          ref={zRef}
          value={z}
        />
      </span>
    </div>
  );
}