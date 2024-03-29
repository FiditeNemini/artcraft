import { useRef } from "react";


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

  const className="h-10 rounded-md bg-brand-secondary p-3 text-white transition-all duration-150 ease-in-out outline-none outline-offset-0 focus:outline-brand-primary";

  function handleOnChange(){
    const newVector = {
      x: Number(xRef.current?.value),
      y: Number(yRef.current?.value),
      z: Number(zRef.current?.value),
    }
    onChange(newVector);
  }
  return(
    <div className="w-full flex gap-2">
      <input
        className={className}
        onChange={handleOnChange}
        ref={xRef}
        value={x}
      />
      <input
        className={className}
        onChange={handleOnChange}
        ref={yRef}
        value={y}
      />
      <input
        className={className}
        onChange={handleOnChange}
        ref={zRef}
        value={z}
      />
    </div>
  );
}