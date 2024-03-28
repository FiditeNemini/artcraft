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
      <input type="number" ref={xRef} onChange={handleOnChange} value={x} />
      <input type="number" ref={yRef} onChange={handleOnChange} value={y} />
      <input type="number" ref={zRef} onChange={handleOnChange} value={z} />
    </div>
  );
}