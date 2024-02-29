import React, {
  useRef,
  // useState
} from 'react';
import {
  faGripDots
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TrimScrubber({
  width
}:{
  width:number
}){
  const ref = useRef<HTMLDivElement>(null);
  return(
    <div className="trim-scrubber" 
      ref={ref}
      style={{width: width + "%"}}
      // onPointerDown={()=>{
      //   if(trimZoneRef.current){
      //     trimZoneRef.current.style.cursor = 'grabbing';
      //     setTrimState((curr)=>({
      //       ...curr,
      //       isScrubbingTrim: true,
      //     }))
      //   }
      // }}
      // onPointerUp={()=>{
      //   if(trimZoneRef.current) {
      //     trimZoneRef.current.style.cursor = 'grab';
      //     setTrimState((curr)=>({
      //       ...curr,
      //       isScrubbingTrim: false,
      //     }));
      //   }
      // }}
      // onPointerMove={(e: PointerEvent<HTMLDivElement>)=>{
      //   if(trimZoneRef.current && playbarRef.current && isScrubbingTrim){
      //     // console.log(fractionToPercentage(
      //     //   (e.clientX - trimZoneRef.current.getBoundingClientRect().left) / (playbarRef.current.getBoundingClientRect().width)
      //     // ) + "%");
      //   }
      // }}
    >
      <FontAwesomeIcon icon={faGripDots} />
    </div>
  );
}
