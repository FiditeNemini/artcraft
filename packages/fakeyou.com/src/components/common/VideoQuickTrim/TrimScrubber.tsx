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
  trimDuration,
  duration,
  width,
  boundingWidth,
  onChange
}:{
  trimStart:number;
  trimDuration: number;
  duration: number;
  boundingWidth: number;
  width:number;
  onChange:(val:QuickTrimData)=>void
}){
  const [{
    left,
    leftOffset,
    pointerStart
  }, setState] = useState<{
    left: number,
    leftOffset:number
    pointerStart:number
  }>({
    left: trimStart/duration*boundingWidth,
    leftOffset: trimStart/duration*boundingWidth,
    pointerStart: -1
  });
  const ref = useRef<HTMLDivElement | null>(null);

  if(ref.current){
    ref.current.style.cursor = pointerStart >= 0 
    ? 'grabbing' : 'grab';
  }

  function handleScrubStart(e: PointerEvent<HTMLDivElement>){
    e.persist();
    // console.log(`start: ${pointerStart}` );
    setState((curr)=>({
      ...curr,
      pointerStart: e.clientX
    })); 
  }
  function handleScrubEnd(e: PointerEvent<HTMLDivElement>){
    e.persist();
    // console.log(`end` );
    setState((curr)=>({
      ...curr,
      pointerStart: -1,
      leftOffset: left,
    })); 
    //console.log(`${duration} * ${left} / ${boundingWidth} = ${duration * left / boundingWidth}`)
    onChange(({
      trimStartSeconds: duration * left / boundingWidth,
      trimEndSeconds: duration  * left / boundingWidth + trimDuration,
    }))
  }
  function handleScrubMove(e: PointerEvent<HTMLDivElement>){
    e.persist();
    if(pointerStart >= 0 && pointerStart!==null && ref.current){
      // console.log(`${e.clientX} - ${pointerStart} = ${e.clientX-pointerStart}`)
      let newLeft = leftOffset + e.clientX - pointerStart;
      // console.log(`${newLeft} + ${boundingWidth * widthPercent/100} > ${boundingWidth}`)
      if (newLeft + width > boundingWidth) {
        newLeft = boundingWidth - width;
      }else if(newLeft < 0) {
        newLeft = 0;
      }
      setState((curr)=>({
        ...curr,
        left: newLeft
      }));
    }
  }
  return(
    <div className="trim-scrubber" 
      ref={ref}
      style={{
        width: width + "px",
        left: left,
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
