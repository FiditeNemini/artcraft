import React,{
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from 'react';

export interface withScrubbingPropsI {
  boundingWidth: number;
  scrubberWidth: number;
  initialLeftOffset?: number; //in pixels
  initialLeftOffsetPercent?: number; // in %, 0 < % < 1
  styleOverride?: {[key: string]: string|number };
  onScrubEnds?: (posPercent: number)=>void;
  //return scrubber location as %, where 0 < % < 1
  onScrubChanges?: (posPercent:number)=>void;
  //return scrubber location as %, where 0 < % < 1
}

type withSrcubbingStates = {
  key: Date,
  currLeftOffset: number,
  prevLeftOffset: number;
  pointerStartPos: number;
}

export const withScrubbing = <P extends withScrubbingPropsI>(Component: React.ComponentType<P>) => ({
  boundingWidth,
  scrubberWidth,
  initialLeftOffset : initialLeftOffsetProps = 0,
  initialLeftOffsetPercent = 0,
  styleOverride = {},
  onScrubEnds,
  onScrubChanges,
  ...rest
}: withScrubbingPropsI) => {
  console.log('withScrubbing reRender');
  const refEl = useRef<HTMLDivElement| null>(null);
  // const initialLeftOffset = 
  //   initialLeftOffsetPercent > 0 ? boundingWidth * initialLeftOffsetPercent 
  //   : initialLeftOffsetProps;
  const initialLeftOffset = 0;
  const [{
    key, currLeftOffset, pointerStartPos
    // prevLeftOffset,
  }, setStates] = useState<withSrcubbingStates>({
    key: new Date(),
    currLeftOffset: initialLeftOffset, // in pixels
    prevLeftOffset: initialLeftOffset, //in pixels
    pointerStartPos: -1 // negative denotes pointer not engaged
  });

  const handleScrubStart = useCallback( (e: MouseEvent) => {
    if(refEl.current){
      console.log(`start: ${e.clientX}` );
      if(refEl.current.contains(e.target as Node)){
        setStates((curr)=>({
          ...curr,
          pointerStartPos: e.clientX
        })); 
        return true;
      }
    }
  },[]);
  const handleScrubEnd = useCallback((e: MouseEvent)=>{
    // e.persist();
    e.preventDefault();
    e.stopPropagation();
    setStates((curr)=>({
      ...curr,
      pointerStartPos: -1,
      prevLeftOffset: curr.currLeftOffset,
    })); 
    // if (onScrubEnds) onScrubEnds(currLeftOffset/boundingWidth);
  }, []);
  const handleScrubMove = useCallback ((e: MouseEvent)=>{
    // e.persist();
    e.preventDefault();
    e.stopPropagation();
    setStates((curr)=>{
      if(curr.pointerStartPos >= 0 && curr.pointerStartPos!==null){
        let newLeftOffset = curr.prevLeftOffset + e.clientX - curr.pointerStartPos;
        if (newLeftOffset + scrubberWidth > boundingWidth) {
          newLeftOffset = boundingWidth - scrubberWidth;
        }else if(newLeftOffset < 0) {
          newLeftOffset = 0;
        }
        if(newLeftOffset !== curr.currLeftOffset){
          return{
            ...curr,
            currLeftOffset: newLeftOffset
          }
        }
      }
      return curr;
    });
      // if (onScrubChanges) onScrubChanges(newLeftOffset/boundingWidth);
  },[scrubberWidth, boundingWidth]);

  useLayoutEffect(() => {
    if(!(window as any)[`${key}listenders`]){
      (window as any)[`${key}listenders`] = true;
      window.addEventListener("mousedown", handleScrubStart);
      window.addEventListener("mouseup", handleScrubEnd);
      window.addEventListener("mousemove", handleScrubMove);
      return () => {
        (window as any)[`${key}listenders`] = false;
        window.removeEventListener("mousedown", handleScrubStart);
        window.removeEventListener("mouseup", handleScrubEnd);
        window.removeEventListener("mousemove", handleScrubMove);
      };
    }
  }, [handleScrubEnd, handleScrubMove, key]);
  return(
    <div
      className="scrubber-wrapper"
      ref={refEl}
      style={{
        position: 'absolute',
        top:0,
        width: scrubberWidth + 'px',
        left: currLeftOffset,
        cursor: pointerStartPos >=0 ? 'grabbing': 'grab',
        ...styleOverride
      }}
    >
      <Component 
        {...rest as P}
      />
    </div>
  );
};
