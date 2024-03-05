import React, {
  useRef,
  // useState,
  // PointerEvent
} from 'react';
import {
  faGripDots
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QuickTrimData } from './types';

export default function TrimScrubber({
  trimStart,
  trimEnd,
  width,
  onChange
}:{
  trimStart:number;
  trimEnd: number;
  boundingWidth: number;
  width:number;
  onChange:(val:QuickTrimData)=>void
}){
  const ref = useRef<HTMLDivElement>(null);
  // const [{
  //   // leftOffset,
  //   pointerStart
  // }, setState] = useState<{
  //   leftOffset:number
  //   pointerStart:number
  // }>({
  //   leftOffset:0,
  //   pointerStart: -1
  // });

  // const [left, setLeft] = useState<number>(0);
  // if(ref.current){
  //   ref.current.style.cursor = pointerStart >= 0 
  //   ? 'grabbing' : 'grab';
  // }
  // function handleScrubStart(e: PointerEvent<HTMLDivElement>){
  //   setState((curr)=>({
  //     ...curr,
  //     pointerStart: e.clientX
  //   })); 
  // }
  // function handleScrubEnd(e: PointerEvent<HTMLDivElement>){
  //   setState((curr)=>({
  //     ...curr,
  //     pointerStart: -1
  //   })); 
  // }
  // function handleScrubMove(e: PointerEvent<HTMLDivElement>){
  //   if(pointerStart >= 0  && ref.current){
  //     setLeft(e.clientX - ref.current.getBoundingClientRect().left);
  //   }
  // }
  return(
    <div className="trim-scrubber" 
      ref={ref}
      style={{
        width: width + "%",
        // left: left
      }}
      // onPointerDown={handleScrubStart}
      // onPointerUp={handleScrubEnd}
      // onPointerLeave={handleScrubEnd}
      // onPointerMove={handleScrubMove}
    >
      <FontAwesomeIcon icon={faGripDots} />
    </div>
  );
}
