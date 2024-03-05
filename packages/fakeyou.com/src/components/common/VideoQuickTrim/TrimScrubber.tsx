import React, {
  useRef,
  useState,
  PointerEvent
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
  const [{
    left,
    leftOffset,
    pointerStart
  }, setState] = useState<{
    left: number,
    leftOffset:number
    pointerStart:number
  }>({
    left:0,
    leftOffset:0,
    pointerStart: -1
  });

  if(ref.current){
    ref.current.style.cursor = pointerStart >= 0 
    ? 'grabbing' : 'grab';
  }
  function handleScrubStart(e: PointerEvent<HTMLDivElement>){
    e.persist();
    console.log(`start: ${pointerStart}` );
    setState((curr)=>({
      ...curr,
      pointerStart: e.clientX
    })); 
  }
  function handleScrubEnd(e: PointerEvent<HTMLDivElement>){
    // e.persist();
    console.log(`end` );
    setState((curr)=>({
      ...curr,
      pointerStart: -1,
      leftOffset: curr.left,
    })); 
  }
  function handleScrubMove(e: PointerEvent<HTMLDivElement>){
    e.persist();
    if(pointerStart >= 0 && pointerStart!==null && ref.current){
      console.log(`${e.clientX} - ${pointerStart} = ${e.clientX-pointerStart}`)
      setState((curr)=>({
        ...curr,
        left: leftOffset + e.clientX - pointerStart
      }));
    }
  }
  return(
    <div className="trim-scrubber" 
      ref={ref}
      style={{
        width: width + "%",
        left: left
      }}
      onPointerDown={handleScrubStart}
      onPointerUp={handleScrubEnd}
      onPointerLeave={handleScrubEnd}
      onPointerMove={handleScrubMove}
    >
      <FontAwesomeIcon icon={faGripDots} />
    </div>
  );
}
