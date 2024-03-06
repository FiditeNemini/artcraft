import React,{
  useRef,
  useState,
  PointerEvent,
} from 'react';

export interface withScrubbingPropsI {
  boundingWidth: number;
  scrubberWidth: number;
  styleOverride?: {[key: string]: string|number };
  onScrubEnds?: ()=>number; //return scrubber location as %
  onScrubChanges?: ()=>number; //return scrubber location as %
}
type withSrcubbingStates = {
  currLeftOffset: number,
  prevLeftOffset: number;
  pointerStartPos: number;
}

export const withScrubbing = <P extends withScrubbingPropsI>(Component: React.ComponentType<P>) => ({
  boundingWidth,
  scrubberWidth,
  styleOverride = {},
  onScrubEnds,
  onScrubChanges,
  ...rest
}: withScrubbingPropsI) => {
  // return (props: Omit<P, keyof withScrubbingPropsI>)=>{
  const ref = useRef<HTMLDivElement | null>(null)
  const [{
    currLeftOffset, prevLeftOffset, pointerStartPos
  }, setStates] = useState<withSrcubbingStates>({
    currLeftOffset: 0, // in pixels
    prevLeftOffset: 0, //in pixels
    pointerStartPos: -1 // negative denotes pointer not engaged
  });

  function handleScrubStart(e: PointerEvent<HTMLDivElement>){
    e.persist();
    console.log(`start: ${pointerStartPos} -> ${e.clientX}` );
    setStates((curr)=>({
      ...curr,
      pointerStartPos: e.clientX
    })); 
  }
  function handleScrubEnd(e: PointerEvent<HTMLDivElement>){
    e.persist();
    console.log(`end` );
    setStates((curr)=>({
      ...curr,
      pointerStartPos: -1,
      prevLeftOffset: currLeftOffset,
    })); 
  }
  function handleScrubMove(e: PointerEvent<HTMLDivElement>){
    e.persist();
    if(pointerStartPos >= 0 && pointerStartPos!==null){
      let newLeftOffset = prevLeftOffset + e.clientX - pointerStartPos;
      if (newLeftOffset + scrubberWidth > boundingWidth) {
        newLeftOffset = boundingWidth - scrubberWidth;
      }else if(newLeftOffset < 0) {
        newLeftOffset = 0;
      }
      setStates((curr)=>({
        ...curr,
        currLeftOffset: newLeftOffset
      }));
    }
  }
  return(
    <div
      ref={ref}
      className="scrubber-wrapper"
      style={{
        position: 'absolute',
        top:0,
        width: scrubberWidth + 'px',
        left: currLeftOffset,
        cursor: pointerStartPos >=0 ? 'grabbing': 'grab',
        ...styleOverride
      }}
      onPointerDown={handleScrubStart}
      onPointerUp={handleScrubEnd}
      onPointerLeave={handleScrubEnd}
      onPointerMove={handleScrubMove}
    >
      <Component 
        {...rest as P}
      />
    </div>
  );
// }
};
