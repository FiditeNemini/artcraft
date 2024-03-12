import React,{
  memo,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';

export interface withScrubbingPropsI {
  debug?: boolean
  boundingWidth: number;
  scrubberWidth: number;
  scrubPosition?: number; // scrubber location as px
  styleOverride?: {[key: string]: string|number };
  onScrubChanged?: (newPos: number)=>void;
  //return scrubber location as px
}

type withSrcubbingStates = {
  currLeftOffset: number,
  prevLeftOffset: number;
  pointerStartPos: number;
}

export const withScrubbing = <P extends withScrubbingPropsI>(Component: React.ComponentType<P>) => memo(({
  debug: propsDebug = false,
  boundingWidth,
  scrubberWidth,
  scrubPosition: propsLeftOffset = 0,
  styleOverride = {},
  onScrubChanged,
  ...rest
}: withScrubbingPropsI) => {
  const debug = false ;//|| propsDebug;
  if (debug) console.log(`withSCRUBBING reRENDERING!! `);

  const refEl = useRef<HTMLDivElement| null>(null);
  const refListener = useRef<number>(Date.now());

  const [{
    currLeftOffset, pointerStartPos,
    prevLeftOffset
  }, setStates] = useState<withSrcubbingStates>({
    currLeftOffset: propsLeftOffset,
    prevLeftOffset: propsLeftOffset,
    pointerStartPos: -1 // negative denotes pointer not engaged
  });

  useLayoutEffect(() => {
    // if (debug) console.log(`withSCRUBBING useLAYOUTeffect!! `);
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
        setBySelf: Date.now(),
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
              currLeftOffset: newLeftOffset,
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
    // if (debug) console.log(`withSCRUBBING useEFFECT!! `);
    if(onScrubChanged && boundingWidth > 0 && prevLeftOffset >= 0 && propsLeftOffset !== prevLeftOffset){
      onScrubChanged(prevLeftOffset);
    }
  },[propsLeftOffset, prevLeftOffset, boundingWidth, onScrubChanged]);

  useEffect(()=>{
    // this takes a forced reset on leftoffset
    setStates((curr)=>{
      if(curr.prevLeftOffset === curr.currLeftOffset
        && propsLeftOffset !== curr.prevLeftOffset
        && propsLeftOffset !== curr.prevLeftOffset
      ){
        return {
          ...curr,
          currLeftOffset: propsLeftOffset, // in pixels
          prevLeftOffset: propsLeftOffset, //in pixels
        }
      }else{
        return curr
      }
    });
  }, [propsLeftOffset])

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
