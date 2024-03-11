import React,{
  memo,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  // useCallback,
} from 'react';

export interface withScrubbingPropsI {
  boundingWidth: number;
  scrubberWidth: number;
  initialLeftOffset?: number; //in pixels
  initialLeftOffsetPercent?: number; // in %, 0 < % < 1
  styleOverride?: {[key: string]: string|number };
  onScrubChanged?: (posPercent: number)=>void;
  //return scrubber location as %, where 0 < % < 1
}

type withSrcubbingStates = {
  key: number,
  currLeftOffset: number,
  prevLeftOffset: number;
  pointerStartPos: number;
}

export const withScrubbing = <P extends withScrubbingPropsI>(Component: React.ComponentType<P>) => memo(({
  boundingWidth,
  scrubberWidth,
  initialLeftOffset : initialLeftOffsetProps = 0,
  initialLeftOffsetPercent = 0,
  styleOverride = {},
  onScrubChanged,
  ...rest
}: withScrubbingPropsI) => {
  console.log(`withSCRUBBING reRENDERING!! `);
  const refEl = useRef<HTMLDivElement| null>(null);
  const refListener = useRef<number>(Date.now());

  const initialLeftOffset = 
    initialLeftOffsetPercent > 0 ? boundingWidth * initialLeftOffsetPercent 
    : initialLeftOffsetProps;

  const [{
    // key, 
    currLeftOffset, pointerStartPos,
    prevLeftOffset,
  }, setStates] = useState<withSrcubbingStates>({
    key: Date.now(),
    currLeftOffset: initialLeftOffset, // in pixels
    prevLeftOffset: initialLeftOffset, //in pixels
    pointerStartPos: -1 // negative denotes pointer not engaged
  });

  useLayoutEffect(() => {
    console.log(`withSCRUBBING useLAYOUTeffect!! `);
    function handleScrubStart (e: MouseEvent) {
      if(refEl.current){
        if(refEl.current.contains(e.target as Node)){
          setStates((curr)=>({
            ...curr,
            pointerStartPos: e.clientX
          })); 
          return true;
        }
      }
    };
    function handleScrubEnd (e: MouseEvent){
      e.preventDefault();
      e.stopPropagation();
      setStates((curr)=>({
        ...curr,
        pointerStartPos: -1,
        prevLeftOffset: curr.currLeftOffset,
      })); 
    };
    function handleScrubMove (e: MouseEvent){
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
    };
    if(!(window as any)[`listener-id-${refListener}`]){
      (window as any)[`listender-id-${refListener}`] = true;
      window.addEventListener("mousedown", handleScrubStart);
      window.addEventListener("mouseup", handleScrubEnd);
      window.addEventListener("mousemove", handleScrubMove);
      return () => {
        (window as any)[`listener-id-${refListener}`] = false;
        window.removeEventListener("mousedown", handleScrubStart);
        window.removeEventListener("mouseup", handleScrubEnd);
        window.removeEventListener("mousemove", handleScrubMove);
      };
    }
  }, [scrubberWidth, boundingWidth]);

  useEffect(()=>{
    console.log(`withSCRUBBING useEFFECT!! `);
    const positionInPercentage = prevLeftOffset/boundingWidth;
    if(onScrubChanged 
      && typeof positionInPercentage === "number" 
      && positionInPercentage >= 0
    ){
      onScrubChanged(prevLeftOffset/boundingWidth);
    }
  },[prevLeftOffset, boundingWidth, onScrubChanged]);

  return(
    <div
      className="scrubber-wrapper"
      ref={refEl}
      style={{
        position: 'absolute',
        top:0,
        width: scrubberWidth + 'px',
        left: currLeftOffset + 'px',
        cursor: pointerStartPos >=0 ? 'grabbing': 'grab',
        ...styleOverride
      }}
    >
      <Component 
        {...rest as P}
      />
    </div>
  );
});
